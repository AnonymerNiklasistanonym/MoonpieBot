// Local imports
import * as database from "../core";
import * as moonpie from "./requests";
import { createLogFunc } from "../../logging";
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
  const loggerDatabase = createLogFunc(logger, "database", {
    subsection: "setup",
  });
  loggerDatabase.debug("Setup database...");

  // Create database if not already existing
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await database.exists(databasePath, logger))) {
    await database.create(databasePath, logger);
  }

  // TODO Update this and think about migrations on later versions

  // Setup database tables
  // > Create Moonpie table if not existing
  await database.requests.post(
    databasePath,
    database.queries.createTable(
      moonpie.table.name,
      [
        {
          name: moonpie.table.column.twitchId,
          options: { notNull: true, primaryKey: true, unique: true },
          type: database.queries.CreateTableColumnType.TEXT,
        },
        {
          name: moonpie.table.column.twitchName,
          options: { notNull: true },
          type: database.queries.CreateTableColumnType.TEXT,
        },
        {
          name: moonpie.table.column.moonpieCount,
          options: { notNull: true },
          type: database.queries.CreateTableColumnType.INTEGER,
        },
        {
          name: moonpie.table.column.date,
          options: { notNull: true },
          type: database.queries.CreateTableColumnType.INTEGER,
        },
      ],
      true
    ),
    undefined,
    logger
  );
  // > Create Moonpie leaderboard table if not existing
  await database.requests.post(
    databasePath,
    database.queries.createView(
      moonpie.viewLeaderboard.name,
      moonpie.table.name,
      [
        {
          columnName: moonpie.table.column.twitchId,
          tableName: moonpie.table.name,
          alias: moonpie.viewLeaderboard.column.twitchId,
        },
        {
          columnName: moonpie.table.column.twitchName,
          tableName: moonpie.table.name,
          alias: moonpie.viewLeaderboard.column.twitchName,
        },
        {
          columnName: moonpie.table.column.moonpieCount,
          tableName: moonpie.table.name,
          alias: moonpie.viewLeaderboard.column.moonpieCount,
        },
        {
          columnName: `ROW_NUMBER () OVER (ORDER BY ${moonpie.table.name}.${moonpie.table.column.moonpieCount} DESC, ${moonpie.table.name}.${moonpie.table.column.date} ASC, ${moonpie.table.name}.${moonpie.table.column.twitchName} ASC)`,
          alias: moonpie.viewLeaderboard.column.rank,
        },
      ],
      {
        orderBy: [
          {
            ascending: false,
            column: moonpie.table.column.moonpieCount,
          },
          {
            ascending: true,
            column: moonpie.table.column.date,
          },
          {
            ascending: true,
            column: moonpie.table.column.twitchName,
          },
        ],
      },
      true
    ),
    undefined,
    logger
  );
  loggerDatabase.debug(`Database tables were created/loaded '${databasePath}'`);
};

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 * @param logger Logger (used for logging).
 */
export const setupInitialData = async (
  databasePath: string,
  logger: Logger
): Promise<void> => {
  const loggerDatabase = createLogFunc(logger, "database", {
    subsection: "setup_initial_data",
  });
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
        id: "533005638",
        name: "Boss727",
        count: 727,
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
        id: "533005639",
        name: "Boss42",
        count: 42,
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
