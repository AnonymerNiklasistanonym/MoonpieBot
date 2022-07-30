// Local imports
import * as database from "../core";
import * as moonpie from "./requests";
import { logMessage } from "../../logging";
// Type imports
import type { Logger } from "winston";

export interface DatabaseStructure {
  id: string;
  name: string;
  count: number;
  timestamp: number;
}

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_DB_BACKUP = "database_backup";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 * @param logger Logger (for global logs).
 */
export const exportMoonpieCountTableToJson = async (
  databasePath: string,
  logger: Logger
): Promise<DatabaseStructure[]> => {
  const logDbBackup = logMessage(logger, LOG_ID_MODULE_DB_BACKUP);

  logDbBackup.info("Backup database..");

  // Create database
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await database.exists(databasePath, logger))) {
    logDbBackup.info("Database not found");
    throw Error(moonpie.GeneralError.NOT_EXISTING);
  }
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await database.open(databasePath, logger);

  // Moonpie table
  const moonpieData = await database.requests.getAll<DatabaseStructure>(
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
  return moonpieData;
};
