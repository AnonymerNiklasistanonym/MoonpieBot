// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import * as moonpie from "./requests";
import { createLogFunc } from "../../logging";
import { createLogMethod } from "./logging";
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
const LOG_ID = "database_backup";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to db.sqlite3.
 * @param logger Logger (for global logs).
 */
export const exportMoonpieCountTableToJson = async (
  databasePath: string,
  logger: Logger
): Promise<DatabaseStructure[]> => {
  const logDbBackup = createLogFunc(logger, LOG_ID);
  const logMethod = createLogMethod(logger, LOG_ID);

  logDbBackup.debug("Backup moonpie db.sqlite3...");

  // Check if the database exists
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await db.sqlite3.exists(databasePath, logMethod))) {
    logDbBackup.error(Error("Database not found"));
    throw Error(moonpie.GeneralError.NOT_EXISTING);
  }

  // Check if the database can be opened
  // The warning makes literally no sense
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await db.sqlite3.open(databasePath, logMethod, { readOnly: true });

  // Get Moonpie table data
  const moonpieData = await db.requests.getAll<DatabaseStructure>(
    databasePath,
    db.queries.select(
      moonpie.table.name,
      [
        { columnName: moonpie.table.columns.twitchId.name },
        { columnName: moonpie.table.columns.twitchName.name },
        { columnName: moonpie.table.columns.moonpieCount.name },
        { columnName: moonpie.table.columns.date.name },
      ],
      {}
    ),
    undefined,
    logMethod
  );
  return moonpieData;
};
