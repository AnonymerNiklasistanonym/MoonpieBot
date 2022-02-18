import { Database } from "sqlite3";
import * as sqlite from "sqlite3";

import { ErrorCodePostRequest } from "./requests";
import { promises as fs } from "fs";
import { Logger } from "winston";

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
  error?: boolean;
  subsection?: string;
}

const loggerDatabase = (
  logger: Logger,
  message: string | Error,
  options?: LoggerDatabaseOptions
) => {
  logger.log({
    level: options?.error !== undefined ? "error" : "debug",
    message: message.toString(),
    section: "databaseManagement",
    subsection: options?.subsection,
  });
};

export const open = async (
  dbNamePath: string,
  logger: Logger,
  options?: OpenDatabaseOptions
): Promise<Database> => {
  return new Promise((resolve, reject) => {
    loggerDatabase(
      logger,
      `Open '${dbNamePath}' (options=${JSON.stringify(options)})`,
      { subsection: "open" }
    );
    const sqliteOpenMode =
      options !== undefined && options.readOnly
        ? sqlite3.OPEN_READONLY
        : sqlite3.OPEN_READWRITE;
    const db = new sqlite3.Database(dbNamePath, sqliteOpenMode, (err) => {
      if (err) {
        loggerDatabase(logger, err, { error: true, subsection: "open" });
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
  return new Promise((resolve, reject) => {
    loggerDatabase(logger, `Create '${dbNamePath}'`, { subsection: "create" });
    const db = new sqlite3.Database(
      dbNamePath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          loggerDatabase(logger, err, { error: true, subsection: "create" });
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
  loggerDatabase(logger, `Remove '${dbNamePath}'`, { subsection: "remove" });
  try {
    await fs.access(dbNamePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.unlink(dbNamePath);
  } catch (error) {
    // File does not exist, do nothing
    logger.warn(error);
  }
  // Sanity check on Windows
  if (await exists(dbNamePath, logger)) {
    throw Error("Database still exists!");
  }
};

export const exists = async (
  dbNamePath: string,
  logger: Logger
): Promise<boolean> => {
  loggerDatabase(logger, `Does '${dbNamePath}' exist`, { subsection: "exits" });
  try {
    await fs.access(dbNamePath);
    return true;
  } catch (error) {
    // File does not exist
    return false;
  }
};
