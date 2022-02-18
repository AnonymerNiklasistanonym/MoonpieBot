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

export const open = async (
  dbNamePath: string,
  logger: Logger,
  options?: OpenDatabaseOptions
): Promise<Database> => {
  return new Promise((resolve, reject) => {
    logger.debug(`Open ${dbNamePath} (options=${JSON.stringify(options)})`);
    const sqliteOpenMode =
      options !== undefined && options.readOnly
        ? sqlite3.OPEN_READONLY
        : sqlite3.OPEN_READWRITE;
    const db = new sqlite3.Database(dbNamePath, sqliteOpenMode, (err) => {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        logger.debug(`${dbNamePath} was successfully opened`);
        resolve(db);
      }
    });
    db.on("trace", (sql) => {
      logger.debug(`SQL command was run: ${sql}`);
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
    logger.debug(`create database '${dbNamePath}'`);
    const db = new sqlite3.Database(
      dbNamePath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      }
    );
    db.on("trace", (sql) => {
      logger.debug(`SQL command was run: ${sql}`);
    });
  });
};

export const remove = async (
  dbNamePath: string,
  logger: Logger
): Promise<void> => {
  logger.debug(`remove database '${dbNamePath}'`);
  try {
    await fs.access(dbNamePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.unlink(dbNamePath);
  } catch (error) {
    // File does not exist, do nothing
  }
};

export const exists = async (
  dbNamePath: string,
  logger: Logger
): Promise<boolean> => {
  logger.debug(`check if database '${dbNamePath}' exists`);
  try {
    await fs.access(dbNamePath);
    return true;
  } catch (error) {
    // File does not exist
    return false;
  }
};
