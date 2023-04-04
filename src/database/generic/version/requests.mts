// Package imports
import db from "sqlite3-promise-query-api";
// Relative imports
import {
  DbVersionRequestError,
  versionTable,
} from "../../../info/databases/genericVersionDb.mjs";
import { createLogMethod } from "../../logging.mjs";
// Type imports
import type { Logger } from "winston";

// Create
// -----------------------------------------------------------------------------

export interface CreateInput {
  major: number;
  minor: number;
  patch: number;
}

export const createEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Readonly<Logger>,
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_version_create");
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.insert(versionTable.name, [
      versionTable.columns.major.name,
      versionTable.columns.minor.name,
      versionTable.columns.patch.name,
    ]),
    [input.major, input.minor, input.patch],
    logMethod,
  );
  return postResult.lastID;
};

// Remove
// -----------------------------------------------------------------------------

export interface RemoveInput {
  major: number;
  minor: number;
  patch: number;
}

export const removeEntry = async (
  databasePath: string,
  input: RemoveInput,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_version_remove");
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.remove(versionTable.name, {
      and: [
        {
          columnName: versionTable.columns.minor.name,
        },
        {
          columnName: versionTable.columns.patch.name,
        },
      ],
      columnName: versionTable.columns.major.name,
    }),
    [input.major, input.minor, input.patch],
    logMethod,
  );
  return postResult.changes > 0;
};

// Get moonpie count
// -----------------------------------------------------------------------------

export interface GetVersionDbOut {
  major: number;
  minor: number;
  patch: number;
}

export const getVersionDbString = (
  version: Readonly<GetVersionDbOut>,
): string => `${version.major}.${version.minor}.${version.patch}`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetVersionOut extends GetVersionDbOut {}

export const getEntries = async (
  databasePath: string,
  logger: Readonly<Logger>,
): Promise<GetVersionDbOut[]> => {
  const logMethod = createLogMethod(logger, "database_version_get");

  const runResult = await db.default.requests.getAll<GetVersionDbOut>(
    databasePath,
    db.default.queries.select(versionTable.name, [
      versionTable.columns.major.name,
      versionTable.columns.minor.name,
      versionTable.columns.patch.name,
    ]),
    undefined,
    logMethod,
  );
  if (runResult) {
    return runResult;
  }
  throw Error(DbVersionRequestError.NOT_FOUND);
};
