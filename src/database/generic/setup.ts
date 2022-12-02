// Package imports
import db, { SqliteTable, SqliteView } from "sqlite3-promise-query-api";
// Local imports
import * as versionRequests from "./version/requests";
import { compareVersions, getVersionString } from "../../version";
import { createLogFunc } from "../../logging";
import { createLogMethod } from "../logging";
import { versionTable } from "../../info/databases/genericVersionDb";
// Type imports
import type { DbVersionInfo } from "../../info/databases/genericVersionDb";
import type { Logger } from "winston";
import type { OrPromise } from "../../other/types";
import type { SqliteIndex } from "sqlite3-promise-query-api/lib/helper";

export interface MigrateDatabaseInformation {
  name: string;
  relatedVersion: DbVersionInfo;
  type: "added" | "updated" | "fixed" | "removed";
}

export interface SetupDatabaseOptions {
  /** Handle database version migrations. */
  migrateVersion?: (
    oldVersion: DbVersionInfo,
    currentVersion: DbVersionInfo
  ) => OrPromise<MigrateDatabaseInformation[]>;
  /** Setup initial data when the database is created. */
  setupInitialData?: () => OrPromise<string[]>;
}

/**
 * Setup a database by creating tables if not existing, set them up with initial
 * data and migrating changes.
 *
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
  tables: SqliteTable[],
  views: SqliteView[],
  indices: SqliteIndex[],
  currentVersion: DbVersionInfo,
  options: SetupDatabaseOptions | undefined,
  logger: Logger
): Promise<void> => {
  const loggerDatabase = createLogFunc(logger, "database", "setup");
  const logMethod = createLogMethod(logger, "database_setup");
  loggerDatabase.debug(`Setup database '${databasePath}'...`);
  let databaseWasCreated = false;

  // Create database if not already existing
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await db.sqlite3.exists(databasePath, logMethod))) {
    await db.sqlite3.create(databasePath, logMethod);
    databaseWasCreated = true;
  }

  // Setup database if it was created
  if (databaseWasCreated) {
    // Setup database tables
    for (const table of [versionTable, ...tables]) {
      // > Create table if not existing
      await db.requests.post(
        databasePath,
        db.queries.createTable(table.name, Object.values(table.columns), true),
        undefined,
        logMethod
      );
    }

    // Setup database views
    for (const view of views) {
      // > Create view if not existing
      await db.requests.post(
        databasePath,
        db.queries.createView(
          view.name,
          view.tableName,
          Object.values(view.columns),
          view.options,
          true
        ),
        undefined,
        logMethod
      );
    }

    // Setup database indices
    for (const index of indices) {
      // > Create view if not existing
      await db.requests.post(
        databasePath,
        db.queries.createIndex(
          index.name,
          index.tableName,
          index.columns,
          true,
          index.where
        ),
        undefined,
        logMethod
      );
    }

    // Insert initial data
    await versionRequests.createEntry(databasePath, currentVersion, logger);
    if (options?.setupInitialData !== undefined) {
      const initialDataInfo = await options.setupInitialData();
      loggerDatabase.info(
        `Added initial data to database '${databasePath}' (${initialDataInfo.join(
          ", "
        )})`
      );
    }
  }

  // Check for migrations
  const versions = await versionRequests.getEntries(databasePath, logger);
  if (versions.length === 0) {
    throw Error(
      `Database '${databasePath}' had no version, please check the database!`
    );
  } else if (versions.length > 1) {
    throw Error(
      `Database '${databasePath}' had multiple versions, please check the database! (${versions
        .map((a) => getVersionString(a, ""))
        .join(",")})`
    );
  } else if (compareVersions(versions[0], currentVersion) !== 0) {
    loggerDatabase.info(
      `Database '${databasePath}' version is different from the current version: ${getVersionString(
        versions[0],
        ""
      )} (current='${getVersionString(currentVersion, "")}')`
    );
    if (options?.migrateVersion !== undefined) {
      const migrateInfo = await options?.migrateVersion(
        versions[0],
        currentVersion
      );
      for (const migrateInfoPart of migrateInfo) {
        loggerDatabase.info(
          `Migrated database '${databasePath}' to ${getVersionString(
            migrateInfoPart.relatedVersion,
            ""
          )}: ${migrateInfoPart.type} ${migrateInfoPart.name}`
        );
      }
    }
    // Then replace the old version with the current version
    await versionRequests.removeEntry(databasePath, versions[0], logger);
    await versionRequests.createEntry(databasePath, currentVersion, logger);
  }

  loggerDatabase.debug(
    `Database '${databasePath}'@${getVersionString(
      currentVersion,
      ""
    )} was set up`
  );
};
