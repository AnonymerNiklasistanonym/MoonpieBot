// Package imports
import db from "sqlite3-promise-query-api";
// Relative imports
import {
  MoonpieDbError,
  moonpieTable,
} from "../../../info/databases/moonpieDb.mjs";
import { createLogMethod } from "../../logging.mjs";
// Type imports
import type { ExistsDbOut } from "sqlite3-promise-query-api";
import type { Logger } from "winston";

// Exists
// -----------------------------------------------------------------------------

/**
 * Check if moonpie entry exists given a Twitch ID.
 *
 * @param databasePath Path to database.
 * @param twitchId Twitch ID.
 * @param logger Logger (used for logging).
 * @returns True if the moonpie entry exists.
 */
export const existsEntry = async (
  databasePath: string,
  twitchId: string,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_exists");
  try {
    const runResultExists = await db.default.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.default.queries.exists(moonpieTable.name, {
        columnName: moonpieTable.columns.twitchId.name,
      }),
      [twitchId],
      logMethod,
    );
    if (runResultExists) {
      return runResultExists.exists_value === 1;
    }
  } catch (error) {
    return false;
  }
  return false;
};

/**
 * Check if moonpie entry exists given a Twitch name.
 *
 * @param databasePath Path to database.
 * @param twitchName Twitch name.
 * @param logger Logger (used for logging).
 * @returns True if the moonpie entry exists.
 */
export const existsEntryName = async (
  databasePath: string,
  twitchName: string,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_exists_name");
  //logger.debug("database: exists");
  try {
    const runResultExists = await db.default.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.default.queries.exists(moonpieTable.name, {
        columnName: moonpieTable.columns.twitchName.name,
        lower: true,
      }),
      [twitchName.toLowerCase()],
      logMethod,
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
  /** Twitch ID. */
  id: string;
  /** Current Twitch name. */
  name: string;
}

/**
 * Create moonpie entry.
 *
 * @param databasePath Path to database.
 * @param input Moonpie info.
 * @param logger Logger (used for logging).
 * @throws When not able to create moonpie or database fails.
 * @returns ID of the created entry.
 */
export const createEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Readonly<Logger>,
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_create");
  // Special validations for DB entry creation
  // > Check if entry already exists
  if (await existsEntry(databasePath, input.id, logger)) {
    throw Error(MoonpieDbError.ALREADY_EXISTS);
  }

  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.insert(moonpieTable.name, [
      moonpieTable.columns.twitchId.name,
      moonpieTable.columns.twitchName.name,
      moonpieTable.columns.moonpieCount.name,
      moonpieTable.columns.date.name,
    ]),
    [input.id, input.name, 0, 0],
    logMethod,
  );
  return postResult.lastID;
};

// Remove
// -----------------------------------------------------------------------------

/**
 * Remove moonpie entry.
 *
 * @param databasePath Path to database.
 * @param twitchId Twitch ID.
 * @param logger Logger (used for logging).
 * @throws When not able to remove moonpie entry or database fails.
 * @returns True if the moonpie entry was removed or already doesn't exist.
 */
export const removeEntry = async (
  databasePath: string,
  twitchId: string,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_remove");
  if (!(await existsEntry(databasePath, twitchId, logger))) {
    return true;
  }

  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.remove(moonpieTable.name, {
      columnName: moonpieTable.columns.twitchId.name,
    }),
    [twitchId],
    logMethod,
  );
  return postResult.changes > 0;
};

/**
 * Remove moonpie entry.
 *
 * @param databasePath Path to database.
 * @param twitchName Twitch ID.
 * @param logger Logger (used for logging).
 * @throws When not able to remove moonpie entry or database fails.
 * @returns True if the moonpie entry was removed or already doesn't exist.
 */
export const removeEntryName = async (
  databasePath: string,
  twitchName: string,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_remove_name");
  if (!(await existsEntryName(databasePath, twitchName, logger))) {
    return true;
  }

  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.remove(moonpieTable.name, {
      columnName: moonpieTable.columns.twitchName.name,
    }),
    [twitchName],
    logMethod,
  );
  return postResult.changes > 0;
};

// Get moonpie count
// -----------------------------------------------------------------------------

export interface GetMoonpieDbOut {
  count: number;
  id: string;
  name: string;
  timestamp: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetMoonpieOut extends GetMoonpieDbOut {}

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database.
 * @param twitchId Twitch ID.
 * @param logger Logger (used for logging).
 * @throws When not able to get the moonpie count or database fails.
 * @returns The moonpie count of the Twitch ID user.
 */
export const getEntry = async (
  databasePath: string,
  twitchId: string,
  logger: Readonly<Logger>,
): Promise<GetMoonpieOut> => {
  const logMethod = createLogMethod(logger, "database_get_moonpie");
  // Special validations for DB entry request
  // > Check if entry already exists
  if (!(await existsEntry(databasePath, twitchId, logger))) {
    throw Error(MoonpieDbError.NOT_EXISTING);
  }

  const runResult = await db.default.requests.getEach<GetMoonpieDbOut>(
    databasePath,
    db.default.queries.select(
      moonpieTable.name,
      [
        {
          alias: "id",
          columnName: moonpieTable.columns.twitchId.name,
        },
        {
          alias: "count",
          columnName: moonpieTable.columns.moonpieCount.name,
        },
        {
          alias: "name",
          columnName: moonpieTable.columns.twitchName.name,
        },
        {
          alias: "timestamp",
          columnName: moonpieTable.columns.date.name,
        },
      ],
      {
        whereColumns: { columnName: moonpieTable.columns.twitchId.name },
      },
    ),
    [twitchId],
    logMethod,
  );
  if (runResult) {
    return runResult;
  }
  throw Error(MoonpieDbError.NOT_FOUND);
};

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database.
 * @param twitchName Twitch name.
 * @param logger Logger (used for logging).
 * @throws When not able to get the moonpie count or database fails.
 * @returns The moonpie count of the Twitch name user.
 */
export const getEntryName = async (
  databasePath: string,
  twitchName: string,
  logger: Readonly<Logger>,
): Promise<GetMoonpieOut> => {
  const logMethod = createLogMethod(logger, "database_get_moonpie_name");
  // Special validations for DB entry request
  // > Check if entry already exists
  if (!(await existsEntryName(databasePath, twitchName, logger))) {
    throw Error(MoonpieDbError.NOT_EXISTING);
  }

  const runResult = await db.default.requests.getEach<GetMoonpieDbOut>(
    databasePath,
    db.default.queries.select(
      moonpieTable.name,
      [
        {
          alias: "id",
          columnName: moonpieTable.columns.twitchId.name,
        },
        {
          alias: "count",
          columnName: moonpieTable.columns.moonpieCount.name,
        },
        {
          alias: "name",
          columnName: moonpieTable.columns.twitchName.name,
        },
        {
          alias: "timestamp",
          columnName: moonpieTable.columns.date.name,
        },
      ],
      {
        whereColumns: {
          columnName: moonpieTable.columns.twitchName.name,
          lower: true,
        },
      },
    ),
    [twitchName.toLowerCase()],
    logMethod,
  );
  if (runResult) {
    return runResult;
  }
  throw Error(MoonpieDbError.NOT_FOUND);
};

// Update
// -----------------------------------------------------------------------------

export interface UpdateInput {
  count: number;
  id: string;
  name: string;
  timestamp?: number;
}

/**
 * Update entry.
 *
 * @param databasePath Path to database.
 * @param input New account info.
 * @param logger Logger (used for logging).
 * @throws When not able to update account or database fails.
 */
export const updateEntry = async (
  databasePath: string,
  input: UpdateInput,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_update");
  // Special validations for DB entry request
  // > Check if entry already exists
  if (!(await existsEntry(databasePath, input.id, logger))) {
    throw Error(MoonpieDbError.NOT_EXISTING);
  }

  const columns = [
    moonpieTable.columns.twitchName.name,
    moonpieTable.columns.moonpieCount.name,
    moonpieTable.columns.date.name,
  ];
  const values = [
    input.name,
    input.count,
    input.timestamp !== undefined ? input.timestamp : new Date().getTime(),
    input.id,
  ];
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.update(moonpieTable.name, columns, {
      columnName: moonpieTable.columns.twitchId.name,
    }),
    values,
    logMethod,
  );
  return postResult.changes > 0;
};
