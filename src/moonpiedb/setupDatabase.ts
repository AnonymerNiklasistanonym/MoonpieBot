import { Logger } from "winston";
import * as database from "../database";
import * as moonpie from "./moonpieManager";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupTables = async (
  databasePath: string,
  logger: Logger
): Promise<void> => {
  logger.info("Setup database tables");
  await database.open(databasePath, logger);
  // Moonpie table
  await database.requests.post(
    databasePath,
    database.queries.createTable(
      moonpie.table.name,
      [
        // TODO Check if an INTEGER can be used as twitch ID
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
  logger.info("Finished setting up database tables");
};

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupInitialData = async (
  databasePath: string,
  logger: Logger
): Promise<void> => {
  // Add initial account
  try {
    const twitchAccountId = await moonpie.create(
      databasePath,
      {
        id: "533005638",
        name: "Boss",
      },
      logger
    );
    logger.debug(`Example account has the ID: ${twitchAccountId}`);
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
  } catch (err) {
    logger.error(err);
  }
};
