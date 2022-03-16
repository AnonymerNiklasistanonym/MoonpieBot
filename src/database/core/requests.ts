import { open } from "../core";

import { RunResult } from "sqlite3";
import { SqliteInternalError } from "./management";
import type { Logger } from "winston";

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

const loggerDatabase = (
  logger: Logger,
  message: string,
  options?: LoggerDatabaseOptions
) => {
  logger.log({
    level: "debug",
    message: message,
    section: "databaseRequests",
    subsection: options?.subsection,
  });
};

const loggerDatabaseError = (
  logger: Logger,
  message: string,
  error: Error,
  options?: LoggerDatabaseOptions
) => {
  logger.log({
    level: "error",
    message: `${message}: ${error.message}`,
    section: "databaseRequests",
    subsection: options?.subsection,
  });
};

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
  loggerDatabase(logger, `Run query: '${query}'`, {
    subsection: "getEach",
  });
  const db = await open(databasePath, logger, { readOnly: true });
  let requestedElement: DB_OUT;
  return new Promise((resolve, reject) =>
    db
      .on("trace", (sql) =>
        loggerDatabase(logger, sql, { subsection: "getEachSql" })
      )
      .each(
        query,
        parameters,
        (err, row) => {
          if (err) {
            loggerDatabaseError(logger, "Database error row", err, {
              subsection: "getEach",
            });
            reject(err);
          } else {
            requestedElement = row as DB_OUT;
          }
        },
        (err) => {
          if (err) {
            loggerDatabaseError(logger, "Database error", err, {
              subsection: "getEach",
            });
          }
          db.close((errClose) => {
            if (errClose) {
              loggerDatabaseError(logger, "Database error close", errClose, {
                subsection: "getEach",
              });
            }
            if (err || errClose) {
              return reject(err ? err : errClose);
            }
            loggerDatabase(
              logger,
              `Run result each: "${JSON.stringify(requestedElement)}"`,
              { subsection: "getEach" }
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
  loggerDatabase(logger, `Run query: '${query}'`, {
    subsection: "getAll",
  });
  const db = await open(databasePath, logger, { readOnly: true });
  return new Promise((resolve, reject) =>
    db
      .on("trace", (sql) =>
        loggerDatabase(logger, sql, { subsection: "getAllSql" })
      )
      .all(query, parameters, (err, rows) => {
        if (err) {
          loggerDatabaseError(logger, "Database error", err, {
            subsection: "getAll",
          });
        }
        db.close((errClose) => {
          if (errClose) {
            loggerDatabaseError(logger, "Database error close", errClose, {
              subsection: "getAll",
            });
          }
          if (err || errClose) {
            return reject(err ? err : errClose);
          }
          loggerDatabase(logger, `Run Result: '${JSON.stringify(rows)}'`, {
            subsection: "getAll",
          });
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
  loggerDatabase(logger, `Run query: "${query}"`, {
    subsection: "post",
  });
  const db = await open(databasePath, logger);
  return new Promise((resolve, reject) =>
    db
      .on("trace", (sql) =>
        loggerDatabase(logger, sql, { subsection: "postSql" })
      )
      .run(query, parameters, function (err) {
        if (err) {
          loggerDatabaseError(logger, "Database error", err, {
            subsection: "post",
          });
        }
        db.close((errClose) => {
          if (errClose) {
            loggerDatabaseError(logger, "Database error close", errClose, {
              subsection: "post",
            });
          }
          if (err || errClose) {
            return reject(err ? err : errClose);
          }
          loggerDatabase(logger, `Post Result: '${JSON.stringify(this)}'`, {
            subsection: "post",
          });
          resolve(this);
        });
      })
  );
};
