// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import { spotifyConfigTable, SpotifyDbError } from "../info";
import { createLogMethod } from "../../logging";
// Type imports
import type { ExistsDbOut } from "sqlite3-promise-query-api";
import type { Logger } from "winston";

export enum SpotifyConfig {
  REFRESH_TOKEN = "REFRESH_TOKEN",
}

// Create
// -----------------------------------------------------------------------------

export interface ExistsInput {
  channel: string;
  option: SpotifyConfig;
}

/**
 * Create spotify config option entry.
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
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_osu_requests_exists");
  try {
    const runResultExists = await db.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.queries.exists(spotifyConfigTable.name, {
        columnName: spotifyConfigTable.columns.option.name,
      }),
      [input.channel, input.option],
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
  channel: string;
  option: SpotifyConfig;
  optionValue: string;
}

/**
 * Create spotify config option entry.
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
  logger: Logger
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_osu_requests_create");
  const postResult = await db.requests.post(
    databasePath,
    db.queries.insert(spotifyConfigTable.name, [
      spotifyConfigTable.columns.option.name,
      spotifyConfigTable.columns.optionValue.name,
    ]),
    [input.channel, input.option, input.optionValue],
    logMethod
  );
  return postResult.lastID;
};

export const createOrUpdateEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Logger
): Promise<number> => {
  const exists = await existsEntry(
    databasePath,
    {
      channel: input.channel,
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
  channel: string;
  option: SpotifyConfig;
}

/**
 * Remove spotify config option entry.
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
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_remove");
  const postResult = await db.requests.post(
    databasePath,
    db.queries.remove(spotifyConfigTable.name, {
      columnName: spotifyConfigTable.columns.option.name,
    }),
    [input.channel, input.option],
    logMethod
  );
  return postResult.changes > 0;
};

// Get entries
// -----------------------------------------------------------------------------

export interface GetOsuRequestsConfigDbOut {
  option: SpotifyConfig;
  optionValue: string;
}

export const getEntries = async (
  databasePath: string,
  twitchChannel: string,
  logger: Logger
): Promise<GetOsuRequestsConfigDbOut[]> => {
  const logMethod = createLogMethod(
    logger,
    "database_osu_requests_get_entries"
  );

  const runResult = await db.requests.getAll<GetOsuRequestsConfigDbOut>(
    databasePath,
    db.queries.select(spotifyConfigTable.name, [
      {
        alias: "option",
        columnName: spotifyConfigTable.columns.option.name,
      },
      {
        alias: "optionValue",
        columnName: spotifyConfigTable.columns.optionValue.name,
      },
    ]),
    [twitchChannel],
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(SpotifyDbError.NOT_FOUND);
};

// Update
// -----------------------------------------------------------------------------

export interface UpdateInput {
  channel: string;
  option: SpotifyConfig;
  optionValue: string;
}

export const updateEntry = async (
  databasePath: string,
  input: UpdateInput,
  logger: Logger
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_update");
  // Special validations for DB entry request
  // > Check if entry already exists
  if (
    (await existsEntry(
      databasePath,
      { channel: input.channel, option: input.option },
      logger
    )) === false
  ) {
    throw Error(SpotifyDbError.NOT_EXISTING);
  }

  const columns = [
    spotifyConfigTable.columns.option.name,
    spotifyConfigTable.columns.optionValue.name,
  ];
  const values = [input.channel, input.option, input.optionValue];
  const postResult = await db.requests.post(
    databasePath,
    db.queries.update(spotifyConfigTable.name, columns, {
      columnName: spotifyConfigTable.columns.option.name,
    }),
    [...values, input.channel, input.option],
    logMethod
  );
  return postResult.changes;
};
