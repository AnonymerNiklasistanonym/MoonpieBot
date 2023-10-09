// Package imports
import db, { SqliteTable, SqliteView } from "sqlite3-promise-query-api";
// Relative imports
import * as versionRequests from "./version/requests.mjs";
import { compareVersions, getVersionInfo } from "../../version.mjs";
import { createLogFunc } from "../../logging.mjs";
import { createLogMethod } from "../logging.mjs";
import { getVersionDbString } from "./version/requests.mjs";
import { versionTable } from "../../info/databases/genericVersionDb.mjs";
// Type imports
import type { DbVersionInfo } from "../../info/databases/genericVersionDb.mjs";
import type { Logger } from "winston";
import type { OrPromise } from "../../other/types.mjs";
import type { SemVer } from "semver";
import type { SqliteIndex } from "sqlite3-promise-query-api";

export interface MigrateDatabaseInformation {
  name: string;
  relatedVersion: SemVer;
  type: "added" | "updated" | "fixed" | "removed";
}

export interface SetupDatabaseOptions {
  /** Handle database version migrations. */
  migrateVersion?: (
    oldVersion: SemVer,
    currentVersion: SemVer,
  ) => OrPromise<MigrateDatabaseInformation[]>;
  /** Setup initial data when the database is created. */
  setupInitialData?: () => OrPromise<string[]>;
}

/**
 * Setup a database by creating tables if not existing, set them up with initial
 * data and migrating changes.
 * @param databasePath Path to database.
 * @param tables Tables to set up.
 * @param views Views to set up.
 * @param indices Indices to set up.
 * @param currentVersion The current version of the database.
 * @param options Other (optional) setup options.
 * @param logger Logger (for global logs).
 */
export const genericSetupDatabase = async (
  databasePath: string,
  tables: Readonly<SqliteTable>[],
  views: Readonly<SqliteView>[],
  indices: Readonly<SqliteIndex>[],
  currentVersion: Readonly<DbVersionInfo>,
  options: Readonly<SetupDatabaseOptions> | undefined,
  logger: Readonly<Logger>,
): Promise<void> => {
  const loggerDatabase = createLogFunc(logger, "database", "setup");
  const logMethod = createLogMethod(logger, "database_setup");
  loggerDatabase.debug(`Setup database '${databasePath}'...`);
  let databaseWasCreated = false;

  // Create database if not already existing
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await db.default.sqlite3.exists(databasePath, logMethod))) {
    await db.default.sqlite3.create(databasePath, logMethod);
    databaseWasCreated = true;
  }

  // Setup database if it was created
  if (databaseWasCreated) {
    // Setup database tables
    for (const table of [versionTable, ...tables]) {
      // > Create table if not existing
      await db.default.requests.post(
        databasePath,
        db.default.queries.createTable(
          table.name,
          Object.values(table.columns),
          true,
        ),
        undefined,
        logMethod,
      );
    }

    // Setup database views
    for (const view of views) {
      // > Create view if not existing
      await db.default.requests.post(
        databasePath,
        db.default.queries.createView(
          view.name,
          view.tableName,
          Object.values(view.columns),
          view.options,
          true,
        ),
        undefined,
        logMethod,
      );
    }

    // Setup database indices
    for (const index of indices) {
      // > Create view if not existing
      await db.default.requests.post(
        databasePath,
        db.default.queries.createIndex(
          index.name,
          index.tableName,
          index.columns,
          true,
          index.where,
        ),
        undefined,
        logMethod,
      );
    }

    // Insert initial data
    await versionRequests.createEntry(databasePath, currentVersion, logger);
    if (options?.setupInitialData !== undefined) {
      const initialDataInfo = await options.setupInitialData();
      loggerDatabase.info(
        `Added initial data to database '${databasePath}' (${initialDataInfo.join(
          ", ",
        )})`,
      );
    }
  }

  // Check for migrations
  const versions = (await versionRequests.getEntries(databasePath, logger)).map(
    (a) => getVersionInfo(getVersionDbString(a)),
  );
  const currentVersionSemVer = getVersionInfo(
    getVersionDbString(currentVersion),
  );
  if (versions.length === 0) {
    throw Error(
      `Database '${databasePath}' had no version, please check the database!`,
    );
  } else if (versions.length > 1) {
    throw Error(
      `Database '${databasePath}' had multiple versions, please check the database! (${versions
        .map((a) => a.version)
        .join(",")})`,
    );
  } else if (compareVersions(versions[0], currentVersionSemVer) !== 0) {
    loggerDatabase.info(
      `Database '${databasePath}' version is different from the current version: ${versions[0].version} (current='${currentVersionSemVer.version}')`,
    );
    if (options?.migrateVersion !== undefined) {
      const migrateInfo = await options.migrateVersion(
        versions[0],
        currentVersionSemVer,
      );
      for (const migrateInfoPart of migrateInfo) {
        loggerDatabase.info(
          `Migrated database '${databasePath}' to ${migrateInfoPart.relatedVersion.version}: ${migrateInfoPart.type} ${migrateInfoPart.name}`,
        );
      }
    }
    // Then replace the old version with the current version
    await versionRequests.removeEntry(databasePath, versions[0], logger);
    await versionRequests.createEntry(databasePath, currentVersion, logger);
  }

  loggerDatabase.debug(
    `Database '${databasePath}'@${currentVersionSemVer.version} was set up`,
  );
};
