import type { Logger } from "winston";
import * as database from "../core";
import * as moonpie from "./moonpieManager";
import { promises as fs } from "fs";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const backupTables = async (
  databasePath: string,
  logger: Logger
): Promise<void> => {
  logger.info("Backup database..");

  // Create database
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await database.exists(databasePath, logger))) {
    logger.info("Database not found");
    return;
  }
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await database.open(databasePath, logger);

  // Moonpie table
  const moonpieData = await database.requests.getAll(
    databasePath,
    database.queries.select(
      moonpie.table.name,
      [
        { columnName: moonpie.table.column.twitchId },
        { columnName: moonpie.table.column.twitchName },
        { columnName: moonpie.table.column.moonpieCount },
        { columnName: moonpie.table.column.date },
      ],
      {}
    ),
    undefined,
    logger
  );
  await fs.writeFile("test.json", JSON.stringify(moonpieData));
  logger.info(`> Database tables were backed up from '${databasePath}'`);
};
