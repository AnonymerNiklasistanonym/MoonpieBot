// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import { OsuRequestsDbError, versionTable } from "../info";
import { createLogMethod } from "../../logging";
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
  logger: Logger
): Promise<number> => {
  const logMethod = createLogMethod(
    logger,
    "database_osu_requests_version_create"
  );
  const postResult = await db.requests.post(
    databasePath,
    db.queries.insert(versionTable.name, [
      versionTable.columns.major.name,
      versionTable.columns.minor.name,
      versionTable.columns.patch.name,
    ]),
    [input.major, input.minor, input.patch],
    logMethod
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
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(
    logger,
    "database_osu_requests_version_remove"
  );
  const postResult = await db.requests.post(
    databasePath,
    db.queries.remove(versionTable.name, {
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
    logMethod
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetVersionOut extends GetVersionDbOut {}

export const getEntries = async (
  databasePath: string,
  logger: Logger
): Promise<GetVersionDbOut[]> => {
  const logMethod = createLogMethod(
    logger,
    "database_osu_requests_version_get"
  );

  const runResult = await db.requests.getAll<GetVersionDbOut>(
    databasePath,
    db.queries.select(versionTable.name, [
      versionTable.columns.major.name,
      versionTable.columns.minor.name,
      versionTable.columns.patch.name,
    ]),
    undefined,
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(OsuRequestsDbError.NOT_FOUND);
};
