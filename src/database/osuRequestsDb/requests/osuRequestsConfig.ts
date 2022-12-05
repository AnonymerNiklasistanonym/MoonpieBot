// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import {
  OsuRequestsConfig,
  osuRequestsConfigTable,
  OsuRequestsDbError,
} from "../../../info/databases/osuRequestsDb";
import { createLogMethod } from "../../logging";
// Type imports
import type { ExistsDbOut } from "sqlite3-promise-query-api";
import type { Logger } from "winston";

// Create
// -----------------------------------------------------------------------------

export interface ExistsInput {
  option: OsuRequestsConfig;
}

/**
 * Create osu!requests config option entry.
 *
 * @param databasePath Path to database.
 * @param input Create info.
 * @param logger Logger (used for logging).
 * @throws When not able to create entry or database fails.
 * @returns ID of the created entry.
 */
export const existsEntry = async (
  databasePath: string,
  input: ExistsInput,
  logger: Readonly<Logger>
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_osu_requests_exists");
  try {
    const runResultExists = await db.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.queries.exists(osuRequestsConfigTable.name, {
        columnName: osuRequestsConfigTable.columns.option.name,
      }),
      [input.option],
      logMethod
    );
    if (runResultExists) {
      return runResultExists.exists_value === 1;
    }
  } catch (error) {
    return false;
  }
  return false;
};

// Create
// -----------------------------------------------------------------------------

export interface CreateInput {
  option: OsuRequestsConfig;
  optionValue: string;
}

/**
 * Create osu!requests config option entry.
 *
 * @param databasePath Path to database.
 * @param input Create info.
 * @param logger Logger (used for logging).
 * @throws When not able to create entry or database fails.
 * @returns ID of the created entry.
 */
export const createEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Readonly<Logger>
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_osu_requests_create");
  const postResult = await db.requests.post(
    databasePath,
    db.queries.insert(osuRequestsConfigTable.name, [
      osuRequestsConfigTable.columns.option.name,
      osuRequestsConfigTable.columns.optionValue.name,
    ]),
    [input.option, input.optionValue],
    logMethod
  );
  return postResult.lastID;
};

export const createOrUpdateEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Readonly<Logger>
): Promise<number> => {
  const exists = await existsEntry(
    databasePath,
    {
      option: input.option,
    },
    logger
  );
  if (!exists) {
    return await createEntry(databasePath, input, logger);
  } else {
    return await updateEntry(databasePath, input, logger);
  }
};

// Remove
// -----------------------------------------------------------------------------

export interface RemoveInput {
  option: OsuRequestsConfig;
}

/**
 * Remove osu!requests config option entry.
 *
 * @param databasePath Path to database.
 * @param input Remove input.
 * @param logger Logger (used for logging).
 * @throws When not able to remove entry or database fails.
 * @returns True if the entry was removed or already doesn't exist.
 */
export const removeEntry = async (
  databasePath: string,
  input: RemoveInput,
  logger: Readonly<Logger>
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_osu_requests_remove");
  const postResult = await db.requests.post(
    databasePath,
    db.queries.remove(osuRequestsConfigTable.name, {
      columnName: osuRequestsConfigTable.columns.option.name,
    }),
    [input.option],
    logMethod
  );
  return postResult.changes > 0;
};

// Get entries
// -----------------------------------------------------------------------------

interface GetOsuRequestsConfigDbOut {
  option: OsuRequestsConfig;
  optionValue: string;
}

export interface GetOsuRequestsConfigOut {
  option: OsuRequestsConfig;
  optionValue: string;
}

export const getEntries = async (
  databasePath: string,
  logger: Readonly<Logger>
): Promise<GetOsuRequestsConfigOut[]> => {
  const logMethod = createLogMethod(
    logger,
    "database_osu_requests_get_entries"
  );

  const runResult = await db.requests.getAll<GetOsuRequestsConfigDbOut>(
    databasePath,
    db.queries.select(osuRequestsConfigTable.name, [
      {
        alias: "option",
        columnName: osuRequestsConfigTable.columns.option.name,
      },
      {
        alias: "optionValue",
        columnName: osuRequestsConfigTable.columns.optionValue.name,
      },
    ]),
    undefined,
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(OsuRequestsDbError.NOT_FOUND);
};

// Update
// -----------------------------------------------------------------------------

export interface UpdateInput {
  option: OsuRequestsConfig;
  optionValue: string;
}

export const updateEntry = async (
  databasePath: string,
  input: UpdateInput,
  logger: Readonly<Logger>
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_update");
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await existsEntry(databasePath, input, logger)) === false) {
    throw Error(OsuRequestsDbError.NOT_EXISTING);
  }

  const columns = [osuRequestsConfigTable.columns.optionValue.name];
  const values = [input.optionValue];
  const postResult = await db.requests.post(
    databasePath,
    db.queries.update(osuRequestsConfigTable.name, columns, {
      columnName: osuRequestsConfigTable.columns.option.name,
    }),
    [...values, input.option],
    logMethod
  );
  return postResult.changes;
};
