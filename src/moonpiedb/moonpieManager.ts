import { Logger } from "winston";
import * as database from "../database";

/** Errors that can happen during moonpie entry creations */
export enum CreateError {
  ALREADY_EXISTS = "MOONPIE_ALREADY_EXISTS",
}

/** Errors that can happen during moonpie requests */

export enum GeneralError {
  NO_ACCESS = "MOONPIE_NO_ACCESS",
  NOT_EXISTING = "MOONPIE_NOT_EXISTING",
  NOT_FOUND = "NOT_FOUND",
}

/** Information about the SQlite table for moonpies */
export const table = {
  /** SQlite column names for moonpie table */
  column: {
    /** The *unique* Twitch ID */
    twitchId: "id",
    /** The *current* Twitch account name at the last time of the claim (for the leaderboard) */
    twitchName: "name",
    /** The timestamp at the last time of the claim (for time based claims) */
    date: "timestamp",
    /** The current number of moonpies */
    moonpieCount: "count",
  },
  /** SQlite table name for moonpies */
  name: "moonpie",
} as const;

/** Information about the SQlite table for moonpies */
export const viewLeaderboard = {
  /** SQlite column names for moonpie table */
  column: {
    /** The *unique* Twitch ID */
    twitchId: "id",
    /** The *current* Twitch account name at the last time of the claim (for the leaderboard) */
    twitchName: "name",
    /** The current number of moonpies */
    moonpieCount: "count",
    /** The current rank on the leaderboard */
    rank: "rank",
  },
  /** SQlite table name for moonpies */
  name: "moonpieleaderboard",
} as const;

// Exists
// -----------------------------------------------------------------------------

/**
 * Check if moonpie entry exists given a Twitch ID.
 *
 * @param databasePath Path to database
 * @param id Twitch ID
 * @returns True if the moonpie entry exists
 */
export const exists = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<boolean> => {
  logger.debug("database: exists");
  try {
    /*<database.queries.ExistsDbOut>*/
    const runResultExists = await database.requests.getEach(
      databasePath,
      database.queries.exists(table.name, table.column.twitchId),
      [twitchId],
      logger
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
 * @param databasePath Path to database
 * @param twitchName Twitch name
 * @returns True if the moonpie entry exists
 */
export const existsName = async (
  databasePath: string,
  twitchName: string,
  logger: Logger
): Promise<boolean> => {
  logger.debug("database: exists");
  try {
    /*<database.queries.ExistsDbOut>*/
    const runResultExists = await database.requests.getEach(
      databasePath,
      database.queries.exists(table.name, `lower(${table.column.twitchName})`),
      [twitchName.toLowerCase()],
      logger
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
  /** Twitch ID */
  id: string;
  /** Current Twitch name */
  name: string;
}

/**
 * Create moonpie entry.
 *
 * @param databasePath Path to database
 * @param input Moonpie info
 * @throws When not able to create moonpie or database fails
 * @returns ID of the created entry
 */
export const create = async (
  databasePath: string,
  input: CreateInput,
  logger: Logger
): Promise<number> => {
  // Special validations for DB entry creation
  // > Check if entry already exists
  if (await exists(databasePath, input.id, logger)) {
    throw Error(CreateError.ALREADY_EXISTS);
  }

  const postResult = await database.requests.post(
    databasePath,
    database.queries.insert(table.name, [
      table.column.twitchId,
      table.column.twitchName,
      table.column.moonpieCount,
      table.column.date,
    ]),
    [input.id, input.name, 0, 0],
    logger
  );
  return postResult.lastID;
};

// Remove
// -----------------------------------------------------------------------------

/**
 * Remove moonpie entry.
 *
 * @param databasePath Path to database
 * @param twitchId Twitch ID
 * @throws When not able to remove moonpie entry or database fails
 * @returns True if the moonpie entry was removed or already doesn't exist
 */
export const remove = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<boolean> => {
  if ((await exists(databasePath, twitchId, logger)) === false) {
    return true;
  }

  const postResult = await database.requests.post(
    databasePath,
    database.queries.remove(table.name, table.column.twitchId),
    [twitchId],
    logger
  );
  return postResult.changes > 0;
};

// Get moonpie count
// -----------------------------------------------------------------------------

export interface GetMoonpieDbOut {
  id: string;
  name: string;
  count: number;
  timestamp: number;
}

export interface GetMoonpieOut {
  id: string;
  name: string;
  count: number;
  timestamp: number;
}

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database
 * @param twitchId Twitch ID
 * @throws When not able to get the moonpie count or database fails
 * @returns The moonpie count of the Twitch ID user
 */
export const getMoonpie = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<GetMoonpieOut> => {
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await exists(databasePath, twitchId, logger)) === false) {
    throw Error(GeneralError.NOT_EXISTING);
  }

  const runResult = await database.requests.getEach<GetMoonpieDbOut>(
    databasePath,
    database.queries.select(
      table.name,
      [
        table.column.twitchId,
        table.column.moonpieCount,
        table.column.twitchName,
        table.column.date,
      ],
      {
        whereColumn: table.column.twitchId,
      }
    ),
    [twitchId],
    logger
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
};

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database
 * @param twitchName Twitch name
 * @throws When not able to get the moonpie count or database fails
 * @returns The moonpie count of the Twitch name user
 */
export const getMoonpieName = async (
  databasePath: string,
  twitchName: string,
  logger: Logger
): Promise<GetMoonpieOut> => {
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await existsName(databasePath, twitchName, logger)) === false) {
    throw Error(GeneralError.NOT_EXISTING);
  }

  const runResult = await database.requests.getEach<GetMoonpieDbOut>(
    databasePath,
    database.queries.select(
      table.name,
      [
        table.column.twitchId,
        table.column.moonpieCount,
        table.column.twitchName,
        table.column.date,
      ],
      {
        whereColumn: `lower(${table.column.twitchName})`,
      }
    ),
    [twitchName.toLowerCase()],
    logger
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
};

// Get moonpie count leaderboard
// -----------------------------------------------------------------------------

export interface GetMoonpieLeaderboardDbOut {
  name: string;
  count: number;
  rank: number;
}

export interface GetMoonpieLeaderboardOut {
  name: string;
  count: number;
  rank: number;
}

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database
 * @throws When not able to get the moonpie count or database fails
 * @returns The moonpie count of the Twitch ID user
 */
export const getMoonpieLeaderboard = async (
  databasePath: string,
  limit: number,
  logger: Logger
): Promise<GetMoonpieLeaderboardOut[]> => {
  const runResult = await database.requests.getAll<GetMoonpieLeaderboardDbOut>(
    databasePath,
    database.queries.select(
      viewLeaderboard.name,
      [
        viewLeaderboard.column.moonpieCount,
        viewLeaderboard.column.twitchName,
        viewLeaderboard.column.rank,
      ],
      {
        limit,
      }
    ),
    [],
    logger
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
};

/**
 * Get the moonpie count of a Twitch user.
 *
 * @param databasePath Path to database
 * @param twitchId Twitch ID
 * @throws When not able to get the moonpie count or database fails
 * @returns The moonpie count of the Twitch ID user
 */
export const getMoonpieLeaderboardEntry = async (
  databasePath: string,
  twitchId: string,
  logger: Logger
): Promise<GetMoonpieLeaderboardOut> => {
  const runResult = await database.requests.getEach<GetMoonpieLeaderboardDbOut>(
    databasePath,
    database.queries.select(
      viewLeaderboard.name,
      [
        viewLeaderboard.column.moonpieCount,
        viewLeaderboard.column.twitchName,
        viewLeaderboard.column.rank,
      ],
      {
        whereColumn: {
          columnName: viewLeaderboard.column.twitchId,
        },
      }
    ),
    [twitchId],
    logger
  );
  if (runResult) {
    return runResult;
  }
  throw Error(GeneralError.NOT_FOUND);
};

// Update
// -----------------------------------------------------------------------------

export interface UpdateInput {
  id: string;
  name: string;
  count: number;
  timestamp: number;
}

/**
 * Update account.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input New account info
 * @throws When not able to update account or database fails
 */
export const update = async (
  databasePath: string,
  input: UpdateInput,
  logger: Logger
): Promise<boolean> => {
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await exists(databasePath, input.id, logger)) === false) {
    throw Error(GeneralError.NOT_EXISTING);
  }

  const columns = [
    table.column.twitchName,
    table.column.moonpieCount,
    table.column.date,
  ];
  const values = [input.name, input.count, input.timestamp, input.id];
  const postResult = await database.requests.post(
    databasePath,
    database.queries.update(table.name, columns, table.column.twitchId),
    values,
    logger
  );
  return postResult.changes > 0;
};

// TODO Get leaderboard position
