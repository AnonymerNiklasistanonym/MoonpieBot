// Package imports
import { open } from "../core";
// Local imports
import { createLogFunc } from "../../logging";
// Type imports
import type { Logger } from "winston";
import type { RunResult } from "sqlite3";
import type { SqliteInternalError } from "./management";

/**
 * List of errors that can happen during a post request.
 */
export enum ErrorCodePostRequest {
  /** Some column specification/constraint was violated. */
  SQLITE_CONSTRAINT = "SQLITE_CONSTRAINT",
  /** Hard query error like a duplicated column or non existing column. */
  SQLITE_ERROR = "SQLITE_ERROR",
}

/**
 * Check if an error is a database error.
 *
 * @param error A possible database error.
 * @returns True if database error.
 */
export const isDatabaseError = (error: unknown): boolean => {
  if (
    error !== undefined &&
    (error as SqliteInternalError).code !== undefined
  ) {
    if (
      (error as SqliteInternalError).code ===
      ErrorCodePostRequest.SQLITE_CONSTRAINT
    ) {
      return true;
    }
    if (
      (error as SqliteInternalError).code === ErrorCodePostRequest.SQLITE_ERROR
    ) {
      return true;
    }
  }
  return false;
};

interface LoggerDatabaseOptions {
  subsection?: string;
}

/**
 * The logging ID of this chat handler.
 */
const LOG_ID_DATABASE_REQUESTS = "database_requests";

const logDatabase = (logger: Logger, options?: LoggerDatabaseOptions) =>
  createLogFunc(logger, LOG_ID_DATABASE_REQUESTS, options?.subsection);

/**
 * Get one result from the database.
 *
 * @param databasePath Path to database.
 * @param query The database query that should be run.
 * @param parameters Optional values that are inserted for query `?` symbols.
 * @param logger Logger (used for logging).
 * @returns Either undefined when no result or the found result.
 */
// Disable eslint warning because never/unknown make it impossible to use types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEach = async <DB_OUT extends { [key: string]: any }>(
  databasePath: string,
  query: string,
  parameters: (string | number)[] = [],
  logger: Logger
): Promise<DB_OUT | undefined> => {
  const logDbGetEach = logDatabase(logger, { subsection: "getEach" });
  const logDbGetEachSql = logDatabase(logger, { subsection: "getEach:Sql" });
  logDbGetEach.debug(`Run query: '${query}'`);
  const db = await open(databasePath, logger, { readOnly: true });
  let requestedElement: DB_OUT;
  return new Promise((resolve, reject) =>
    db
      .on("trace", (sql) => logDbGetEachSql.debug(sql))
      .each(
        query,
        parameters,
        (err, row) => {
          if (err) {
            logDbGetEach.error(Error(`Database error row: ${err.message}`));
            reject(err);
          } else {
            requestedElement = row as DB_OUT;
          }
        },
        (err) => {
          if (err) {
            logDbGetEach.error(Error(`Database error: ${err.message}`));
          }
          db.close((errClose) => {
            if (errClose) {
              logDbGetEach.error(
                Error(`Database error close: ${errClose.message}`)
              );
            }
            if (err || errClose) {
              return reject(err ? err : errClose);
            }
            logDbGetEach.debug(
              `Run result each: "${JSON.stringify(requestedElement)}"`
            );
            resolve(requestedElement);
          });
        }
      )
  );
};

/**
 * Get a list of results from the database.
 *
 * @param databasePath Path to database.
 * @param query The database query that should be run.
 * @param parameters Optional values that are inserted for query `?` symbols.
 * @param logger Logger (used for logging).
 * @returns Either an empty list when no result or the found results.
 */
// Disable eslint warning because never/unknown make it impossible to use types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAll = async <DB_OUT extends { [key: string]: any }>(
  databasePath: string,
  query: string,
  parameters: (string | number)[] = [],
  logger: Logger
): Promise<DB_OUT[]> => {
  const logDbGetAll = logDatabase(logger, { subsection: "getAll" });
  const logDbGetAllSql = logDatabase(logger, { subsection: "getAll:Sql" });
  logDbGetAll.debug(`Run query: '${query}'`);
  const db = await open(databasePath, logger, { readOnly: true });
  return new Promise((resolve, reject) =>
    db
      .on("trace", (sql) => logDbGetAllSql.debug(sql))
      .all(query, parameters, (err, rows) => {
        if (err) {
          logDbGetAll.error(Error(`Database error: ${err.message}`));
        }
        db.close((errClose) => {
          if (errClose) {
            logDbGetAll.error(
              Error(`Database error close: ${errClose.message}`)
            );
          }
          if (err || errClose) {
            return reject(err ? err : errClose);
          }
          logDbGetAll.debug(`Run Result: '${JSON.stringify(rows)}'`);
          resolve(rows);
        });
      })
  );
};

/**
 * Update something in database.
 *
 * @param databasePath Path to database.
 * @param query The database query that should be run.
 * @param parameters Optional values that are inserted for query `?` symbols.
 * @param logger Logger (used for logging).
 * @returns Database update info.
 */
export const post = async (
  databasePath: string,
  query: string,
  parameters: (string | number)[] = [],
  logger: Logger
): Promise<RunResult> => {
  const logDbPost = logDatabase(logger, { subsection: "post" });
  const logDbPostSql = logDatabase(logger, { subsection: "post:Sql" });
  logDbPost.debug(`Run query: "${query}"`);
  const db = await open(databasePath, logger);
  return new Promise((resolve, reject) =>
    db
      .on("trace", (sql) => logDbPostSql.debug(sql))
      .run(query, parameters, function (err) {
        if (err) {
          logDbPost.error(Error(`Database error: ${err.message}`));
        }
        db.close((errClose) => {
          if (errClose) {
            logDbPost.error(Error(`Database error close: ${errClose.message}`));
          }
          if (err || errClose) {
            return reject(err ? err : errClose);
          }
          logDbPost.debug(`Post Result: '${JSON.stringify(this)}'`);
          resolve(this);
        });
      })
  );
};
