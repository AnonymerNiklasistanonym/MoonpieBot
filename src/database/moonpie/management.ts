// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import * as moonpie from "./requests";
import { createLogFunc } from "../../logging";
import { createLogMethod } from "./logging";
// Type imports
import type { Logger } from "winston";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 * @param logger Logger (for global logs).
 */
export const createAndSetupTables = async (
  databasePath: string,
  logger: Logger
): Promise<void> => {
  const loggerDatabase = createLogFunc(logger, "database", "setup");
  const logMethod = createLogMethod(logger, "database_sqlite");
  loggerDatabase.debug("Setup database...");

  // Create database if not already existing
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await db.sqlite3.exists(databasePath, logMethod))) {
    await db.sqlite3.create(databasePath, logMethod);
  }

  // TODO Update this and think about migrations on later versions

  // Setup database tables
  // > Create Moonpie table if not existing
  await db.requests.post(
    databasePath,
    db.queries.createTable(
      moonpie.table.name,
      Object.values(moonpie.table.columns),
      true
    ),
    undefined,
    logMethod
  );
  // > Create Moonpie leaderboard table if not existing
  await db.requests.post(
    databasePath,
    db.queries.createView(
      moonpie.viewLeaderboard.name,
      moonpie.viewLeaderboard.tableName,
      Object.values(moonpie.viewLeaderboard.columns),
      {
        orderBy: [
          {
            ascending: false,
            column: moonpie.table.columns.moonpieCount.name,
          },
          {
            ascending: true,
            column: moonpie.table.columns.date.name,
          },
          {
            ascending: true,
            column: moonpie.table.columns.twitchName.name,
          },
        ],
      },
      true
    ),
    undefined,
    logMethod
  );
  loggerDatabase.debug(`Database tables were created/loaded '${databasePath}'`);
};

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 * @param logger Logger (used for logging).
 */
/*
export const setupInitialData = async (
  databasePath: string,
  logger: Logger
): Promise<void> => {
  const loggerDatabase = createLogFunc(
    logger,
    "database",
    "setup_initial_data"
  );
  // Add initial account
  try {
    await moonpie.create(
      databasePath,
      {
        id: "533005638",
        name: "Boss",
      },
      logger
    );
    await moonpie.update(
      databasePath,
      {
        count: 727,
        id: "533005638",
        name: "Boss727",
        timestamp: new Date().getTime(),
      },
      logger
    );
    await moonpie.create(
      databasePath,
      {
        id: "533005639",
        name: "Boss42",
      },
      logger
    );
    await moonpie.update(
      databasePath,
      {
        count: 42,
        id: "533005639",
        name: "Boss42",
        timestamp: new Date().getTime(),
      },
      logger
    );
    await moonpie.create(
      databasePath,
      {
        id: "533005640",
        name: "Boss0",
      },
      logger
    );
  } catch (err) {
    loggerDatabase.error(err as Error);
  }
};
*/
