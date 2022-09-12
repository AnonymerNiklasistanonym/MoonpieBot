// Package imports
import db, { SqliteTable, SqliteView } from "sqlite3-promise-query-api";
// Local imports
import { createLogMethod } from "./logging";
// Type imports
import type { ExistsDbOut } from "sqlite3-promise-query-api/lib/queries";
import type { Logger } from "winston";

/** Errors that can happen during moonpie entry creations. */
export enum CreateError {
  ALREADY_EXISTS = "MOONPIE_ALREADY_EXISTS",
}

/** Errors that can happen during moonpie requests. */
export enum GeneralError {
  NOT_EXISTING = "MOONPIE_NOT_EXISTING",
  NOT_FOUND = "NOT_FOUND",
  NO_ACCESS = "MOONPIE_NO_ACCESS",
}

/** Information about the SQlite table for moonpies. */
export const table: SqliteTable = {
  columns: {
    /** The timestamp at the last time of the claim (for time based claims). */
    date: {
      name: "timestamp",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.INTEGER,
    },
    /** The current number of moonpies. */
    moonpieCount: {
      name: "count",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.INTEGER,
    },
    /** The *unique* Twitch ID. */
    twitchId: {
      name: "id",
      options: { notNull: true, primaryKey: true, unique: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The *current* Twitch account name at the last time of the claim (for the leaderboard). */
    twitchName: {
      name: "name",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "moonpie",
} as const;

/** Information about the SQlite table for moonpies. */
export const viewLeaderboard: SqliteView<
  "moonpieCount" | "rank" | "twitchId" | "twitchName"
> = {
  columns: {
    /** The current number of moonpies. */
    moonpieCount: {
      columnName: "count",
    },
    /** The current rank on the leaderboard. */
    rank: {
      alias: "rank",
      columnName: db.queries.rowNumberOver([
        { ascending: false, column: table.columns.moonpieCount.name },
        { ascending: true, column: table.columns.date.name },
        { ascending: true, column: table.columns.twitchName.name },
      ]),
    },
    /** The *unique* Twitch ID. */
    twitchId: {
      columnName: "id",
    },
    /** The *current* Twitch account name at the last time of the claim (for the leaderboard). */
    twitchName: {
      columnName: "name",
    },
  },
  name: "moonpieleaderboard",
  tableName: table.name,
} as const;

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
export const exists = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_exists");
  //logger.debug("database: exists");
  try {
    const runResultExists = await db.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.queries.exists(table.name, table.columns.twitchId.name),
      [twitchId],
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

/**
 * Check if moonpie entry exists given a Twitch name.
 *
 * @param databasePath Path to database.
 * @param twitchName Twitch name.
 * @param logger Logger (used for logging).
 * @returns True if the moonpie entry exists.
 */
export const existsName = async (
  databasePath: string,
  twitchName: string,
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_exists_name");
  //logger.debug("database: exists");
  try {
    const runResultExists = await db.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.queries.exists(table.name, `lower(${table.columns.twitchName.name})`),
      [twitchName.toLowerCase()],
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
export const create = async (
  databasePath: string,
  input: CreateInput,
  logger: Logger
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_create");
  // Special validations for DB entry creation
  // > Check if entry already exists
  if (await exists(databasePath, input.id, logger)) {
    throw Error(CreateError.ALREADY_EXISTS);
  }

  const postResult = await db.requests.post(
    databasePath,
    db.queries.insert(table.name, [
      table.columns.twitchId.name,
      table.columns.twitchName.name,
      table.columns.moonpieCount.name,
      table.columns.date.name,
    ]),
    [input.id, input.name, 0, 0],
    logMethod
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
export const remove = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_remove");
  if ((await exists(databasePath, twitchId, logger)) === false) {
    return true;
  }

  const postResult = await db.requests.post(
    databasePath,
    db.queries.remove(table.name, table.columns.twitchId.name),
    [twitchId],
    logMethod
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
export const removeName = async (
  databasePath: string,
  twitchName: string,
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_remove_name");
  if ((await existsName(databasePath, twitchName, logger)) === false) {
    return true;
  }

  const postResult = await db.requests.post(
    databasePath,
    db.queries.remove(table.name, table.columns.twitchName.name),
    [twitchName],
    logMethod
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

export interface GetMoonpieOut {
  count: number;
  id: string;
  name: string;
  timestamp: number;
}

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database.
 * @param twitchId Twitch ID.
 * @param logger Logger (used for logging).
 * @throws When not able to get the moonpie count or database fails.
 * @returns The moonpie count of the Twitch ID user.
 */
export const getMoonpie = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<GetMoonpieOut> => {
  const logMethod = createLogMethod(logger, "database_get_moonpie");
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await exists(databasePath, twitchId, logger)) === false) {
    throw Error(GeneralError.NOT_EXISTING);
  }

  const runResult = await db.requests.getEach<GetMoonpieDbOut>(
    databasePath,
    db.queries.select(
      table.name,
      [
        table.columns.twitchId.name,
        table.columns.moonpieCount.name,
        table.columns.twitchName.name,
        table.columns.date.name,
      ],
      {
        whereColumn: table.columns.twitchId.name,
      }
    ),
    [twitchId],
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
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
export const getMoonpieName = async (
  databasePath: string,
  twitchName: string,
  logger: Logger
): Promise<GetMoonpieOut> => {
  const logMethod = createLogMethod(logger, "database_get_moonpie_name");
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await existsName(databasePath, twitchName, logger)) === false) {
    throw Error(GeneralError.NOT_EXISTING);
  }

  const runResult = await db.requests.getEach<GetMoonpieDbOut>(
    databasePath,
    db.queries.select(
      table.name,
      [
        table.columns.twitchId.name,
        table.columns.moonpieCount.name,
        table.columns.twitchName.name,
        table.columns.date.name,
      ],
      {
        whereColumn: `lower(${table.columns.twitchName.name})`,
      }
    ),
    [twitchName.toLowerCase()],
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
};

// Get moonpie count leaderboard
// -----------------------------------------------------------------------------

export interface GetMoonpieLeaderboardDbOut {
  count: number;
  name: string;
  rank: number;
}

export interface GetMoonpieLeaderboardOut {
  count: number;
  name: string;
  rank: number;
}

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database.
 * @param limit Limit the number of results.
 * @param offset Offset from what position to fetch the results.
 * @param logger Logger (used for logging).
 * @throws When not able to get the moonpie count or database fails.
 * @returns The moonpie count of the Twitch ID user.
 */
export const getMoonpieLeaderboard = async (
  databasePath: string,
  limit: number | undefined,
  offset: number | undefined,
  logger: Logger
): Promise<GetMoonpieLeaderboardOut[]> => {
  const logMethod = createLogMethod(logger, "database_get_moonpie_leaderboard");
  const runResult = await db.requests.getAll<GetMoonpieLeaderboardDbOut>(
    databasePath,
    db.queries.select(
      viewLeaderboard.name,
      [
        viewLeaderboard.columns.moonpieCount.columnName,
        viewLeaderboard.columns.twitchName.columnName,
        viewLeaderboard.columns.rank.alias !== undefined
          ? viewLeaderboard.columns.rank.alias
          : viewLeaderboard.columns.rank.columnName,
      ],
      {
        limit,
        offset: offset !== undefined ? Math.max(offset - 1, 0) : undefined,
      }
    ),
    [],
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
};

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database.
 * @param twitchId Twitch ID.
 * @param logger Logger (used for logging).
 * @throws When not able to get the moonpie count or database fails.
 * @returns The moonpie count of the Twitch ID user.
 */
export const getMoonpieLeaderboardEntry = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<GetMoonpieLeaderboardOut> => {
  const logMethod = createLogMethod(
    logger,
    "database_get_moonpie_leaderboard_entry"
  );
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await exists(databasePath, twitchId, logger)) === false) {
    throw Error(GeneralError.NOT_EXISTING);
  }

  const runResult = await db.requests.getEach<GetMoonpieLeaderboardDbOut>(
    databasePath,
    db.queries.select(
      viewLeaderboard.name,
      [
        viewLeaderboard.columns.moonpieCount.columnName,
        viewLeaderboard.columns.twitchName.columnName,
        viewLeaderboard.columns.rank.alias !== undefined
          ? viewLeaderboard.columns.rank.alias
          : viewLeaderboard.columns.rank.columnName,
      ],
      {
        whereColumn: {
          columnName: viewLeaderboard.columns.twitchId.columnName,
        },
      }
    ),
    [twitchId],
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
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
export const update = async (
  databasePath: string,
  input: UpdateInput,
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_update");
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await exists(databasePath, input.id, logger)) === false) {
    throw Error(GeneralError.NOT_EXISTING);
  }

  const columns = [
    table.columns.twitchName.name,
    table.columns.moonpieCount.name,
    table.columns.date.name,
  ];
  const values = [
    input.name,
    input.count,
    input.timestamp !== undefined ? input.timestamp : new Date().getTime(),
    input.id,
  ];
  const postResult = await db.requests.post(
    databasePath,
    db.queries.update(table.name, columns, table.columns.twitchId.name),
    values,
    logMethod
  );
  return postResult.changes > 0;
};
