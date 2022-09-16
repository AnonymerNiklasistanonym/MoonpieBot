// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import { osuRequestsConfigTable, versionCurrent } from "./info";
import { createLogFunc } from "../../logging";
import { createLogMethod } from "../logging";
import { getVersionFromObject } from "../../version";
import moonpieDb from "../moonpieDb";
import { versionTable } from "../generic/version/info";
// Type imports
import type { Logger } from "winston";
/**
 * Create tables if not existing and set them up with data.
 *
 * @param databasePath Path to database.
 * @param logger Logger (for global logs).
 */
export const setup = async (
  databasePath: string,
  logger: Logger
): Promise<void> => {
  const loggerDatabase = createLogFunc(logger, "database", "setup");
  const logMethod = createLogMethod(logger, "database_osu_requests_setup");
  loggerDatabase.debug("Setup database...");

  // Create database if not already existing
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await db.sqlite3.exists(databasePath, logMethod))) {
    await db.sqlite3.create(databasePath, logMethod);
  }

  // Setup database tables
  // > Create version information table if not existing
  await db.requests.post(
    databasePath,
    db.queries.createTable(
      versionTable.name,
      Object.values(versionTable.columns),
      true
    ),
    undefined,
    logMethod
  );
  // > Create moonpie table if not existing
  await db.requests.post(
    databasePath,
    db.queries.createTable(
      osuRequestsConfigTable.name,
      Object.values(osuRequestsConfigTable.columns),
      true
    ),
    undefined,
    logMethod
  );

  // Insert setup data
  // There is currently no data that needs to be set up

  // Check for migrations
  const versions = await moonpieDb.requests.version.getEntries(
    databasePath,
    logger
  );
  if (versions.length === 0) {
    // Add current version if no version is found
    await moonpieDb.requests.version.createEntry(
      databasePath,
      versionCurrent,
      logger
    );
    // TODO Handle migrations
  } else if (versions.length > 1) {
    throw Error("Multiple versions were found, please check the database!");
  } else if (
    versions[0].major !== versionCurrent.major ||
    versions[0].minor !== versionCurrent.minor ||
    versions[0].patch !== versionCurrent.patch
  ) {
    loggerDatabase.info(
      `Database versions are different: '${getVersionFromObject(
        versions[0]
      )}' (current: '${getVersionFromObject(versionCurrent)}')`
    );
    // TODO Handle migrations
    // Then replace the old version with the current version
    await moonpieDb.requests.version.removeEntry(
      databasePath,
      versions[0],
      logger
    );
    await moonpieDb.requests.version.createEntry(
      databasePath,
      versionCurrent,
      logger
    );
  }
};
