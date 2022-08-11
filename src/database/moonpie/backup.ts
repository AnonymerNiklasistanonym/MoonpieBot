// Local imports
import * as database from "../core";
import * as moonpie from "./requests";
import { createLogFunc } from "../../logging";
// Type imports
import type { Logger } from "winston";

export interface DatabaseStructure {
  count: number;
  id: string;
  name: string;
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
  const logDbBackup = createLogFunc(logger, LOG_ID_MODULE_DB_BACKUP);

  logDbBackup.debug("Backup moonpie database...");

  // Check if the database exists
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await database.exists(databasePath, logger))) {
    logDbBackup.error(Error("Database not found"));
    throw Error(moonpie.GeneralError.NOT_EXISTING);
  }

  // Check if the database can be opened
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await database.open(databasePath, logger, { readOnly: true });

  // Get Moonpie table data
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
