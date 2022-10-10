// Package imports
import db, { SqliteTable, SqliteView } from "sqlite3-promise-query-api";
// Local imports
import * as versionRequests from "./version/requests";
import { createLogFunc } from "../../logging";
import { createLogMethod } from "../logging";
import { getVersionFromObject } from "../../version";
import { versionTable } from "../../info/databases/genericVersionDb";
// Type imports
import { DbVersionInfo } from "../../info/databases/genericVersionDb";
import type { Logger } from "winston";

// TODO Make the setup step a generic method

export interface SetupDatabaseOptions {
  /** Handle database version migrations. */
  migrateVersion?: (
    oldVersion: DbVersionInfo | undefined,
    currentVersion: DbVersionInfo
  ) => void | Promise<void>;
  /** Setup initial data when the database is created. */
  setupInitialData?: () => void | Promise<void>;
}

/**
 * Setup a database by creating tables if not existing, set them up with initial
 * data and migrating changes.
 *
 * @param databasePath Path to database.
 * @param tables Tables to set up.
 * @param views Views to set up.
 * @param currentVersion The current version of the database.
 * @param options Other (optional) setup options.
 * @param logger Logger (for global logs).
 */
export const genericSetupDatabase = async (
  databasePath: string,
  tables: SqliteTable[],
  views: SqliteView[],
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

    // Insert initial data
    await versionRequests.createEntry(databasePath, currentVersion, logger);
    if (options?.setupInitialData !== undefined) {
      await options.setupInitialData();
    }
  }

  // Check for migrations
  const versions = await versionRequests.getEntries(databasePath, logger);
  if (versions.length === 0) {
    loggerDatabase.info(
      `Database '${databasePath}' had no version (current: '${getVersionFromObject(
        currentVersion
      )}')`
    );
    if (options?.migrateVersion !== undefined) {
      await options.migrateVersion(undefined, currentVersion);
    }
    // Add current version if no version is found
    await versionRequests.createEntry(databasePath, currentVersion, logger);
  } else if (versions.length > 1) {
    throw Error(
      `Database '${databasePath}' had multiple versions, please check the database! (${versions
        .map((a) => getVersionFromObject(a, ""))
        .join(",")})`
    );
  } else if (
    versions[0].major !== currentVersion.major ||
    versions[0].minor !== currentVersion.minor ||
    versions[0].patch !== currentVersion.patch
  ) {
    loggerDatabase.info(
      `Database '${databasePath}' version is different from the current version: ${getVersionFromObject(
        versions[0],
        ""
      )} (current='${getVersionFromObject(currentVersion, "")}')`
    );
    if (options?.migrateVersion !== undefined) {
      await options?.migrateVersion(versions[0], currentVersion);
    }
    // Then replace the old version with the current version
    await versionRequests.removeEntry(databasePath, versions[0], logger);
    await versionRequests.createEntry(databasePath, currentVersion, logger);
  }

  loggerDatabase.debug(
    `Database '${databasePath}'@${getVersionFromObject(
      currentVersion,
      ""
    )} was set up`
  );
};
