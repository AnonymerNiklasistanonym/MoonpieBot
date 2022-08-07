// Package imports
import * as sqlite from "sqlite3";
import { Database } from "sqlite3";
import { promises as fs } from "fs";
// Local imports
import { createLogFunc } from "../../logging";
import { ErrorCodePostRequest } from "./requests";
// Type imports
import type { Logger } from "winston";

const sqlite3 = sqlite.verbose();

export enum ErrorCodeOpen {
  SQLITE_CANTOPEN = "SQLITE_CANTOPEN",
}

export interface SqliteInternalError extends Error {
  code: ErrorCodePostRequest | ErrorCodeOpen;
}

export interface OpenDatabaseOptions {
  readOnly?: boolean;
}

interface LoggerDatabaseOptions {
  subsection?: string;
}

/**
 * The logging ID of this chat handler.
 */
const LOG_ID_DATABASE_MANAGEMENT = "database_management";

const logDatabase = (logger: Logger, options?: LoggerDatabaseOptions) =>
  createLogFunc(logger, LOG_ID_DATABASE_MANAGEMENT, {
    subsection: options?.subsection,
  });

export const open = async (
  dbNamePath: string,
  logger: Logger,
  options?: OpenDatabaseOptions
): Promise<Database> => {
  const logDbOpen = logDatabase(logger, { subsection: "open" });
  return new Promise((resolve, reject) => {
    logDbOpen.debug(`Open '${dbNamePath}' (${JSON.stringify(options)})`);
    const sqliteOpenMode =
      options !== undefined && options.readOnly
        ? sqlite3.OPEN_READONLY
        : sqlite3.OPEN_READWRITE;
    const db = new sqlite3.Database(dbNamePath, sqliteOpenMode, (err) => {
      if (err) {
        logDbOpen.error(err);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

export enum CreateDatabaseErrorCode {
  SQLITE_MISUSE = "SQLITE_MISUSE",
}

export const create = async (
  dbNamePath: string,
  logger: Logger
): Promise<Database> => {
  const logDbCreate = logDatabase(logger, { subsection: "open" });
  return new Promise((resolve, reject) => {
    logDbCreate.debug(`Create '${dbNamePath}'`);
    const db = new sqlite3.Database(
      dbNamePath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          logDbCreate.error(err);
          reject(err);
        } else {
          resolve(db);
        }
      }
    );
  });
};

export const remove = async (
  dbNamePath: string,
  logger: Logger
): Promise<void> => {
  const logDbRemove = logDatabase(logger, { subsection: "remove" });
  logDbRemove.debug(`Remove '${dbNamePath}'`);
  try {
    await fs.access(dbNamePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.unlink(dbNamePath);
  } catch (error) {
    // File does not exist, do nothing
    //logger.warn(error);
  }
  // Sanity check on Windows
  if (await exists(dbNamePath, logger)) {
    const errorStillExists = Error("Database still exists");
    logDbRemove.error(errorStillExists);
    throw errorStillExists;
  }
};

export const exists = async (
  dbNamePath: string,
  logger: Logger
): Promise<boolean> => {
  logDatabase(logger, { subsection: "exists" }).debug(
    `Does '${dbNamePath}' exist`
  );
  try {
    await fs.access(dbNamePath);
    return true;
  } catch (error) {
    // File does not exist
    return false;
  }
};
