// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import {
  MoonpieDbError,
  moonpieLeaderboardView,
} from "../../../info/databases/moonpieDb";
import { createLogMethod } from "../../logging";
import { existsEntry } from "./moonpie";
// Type imports
import type { Logger } from "winston";

// Get moonpie count leaderboard
// -----------------------------------------------------------------------------

export interface GetMoonpieLeaderboardDbOut {
  count: number;
  name: string;
  rank: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetMoonpieLeaderboardOut extends GetMoonpieLeaderboardDbOut {}

/**
 * Get the moonpie leaderboard.
 *
 * @param databasePath Path to database.
 * @param limit Limit the number of results.
 * @param offset Offset from what position to fetch the results.
 * @param logger Logger (used for logging).
 * @throws When the database fails.
 * @returns A moonpie leaderboard entry list.
 */
export const getEntries = async (
  databasePath: string,
  limit: number | undefined,
  offset: number | undefined,
  logger: Logger
): Promise<GetMoonpieLeaderboardOut[]> => {
  const logMethod = createLogMethod(logger, "database_get_moonpie_leaderboard");
  const runResult = await db.requests.getAll<GetMoonpieLeaderboardDbOut>(
    databasePath,
    db.queries.select(
      moonpieLeaderboardView.name,
      [
        {
          alias: "count",
          columnName: moonpieLeaderboardView.columns.moonpieCount.columnName,
        },
        {
          alias: "name",
          columnName: moonpieLeaderboardView.columns.twitchName.columnName,
        },
        {
          alias: "rank",
          columnName:
            moonpieLeaderboardView.columns.rank.alias !== undefined
              ? moonpieLeaderboardView.columns.rank.alias
              : moonpieLeaderboardView.columns.rank.columnName,
        },
      ],
      {
        limit,
        limitOffset: offset !== undefined ? Math.max(offset - 1, 0) : undefined,
      }
    ),
    [],
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(MoonpieDbError.NOT_FOUND);
};

/**
 * Get the moonpie leaderboard entry of a Twitch user.
 *
 * @param databasePath Path to database.
 * @param twitchId Twitch ID.
 * @param logger Logger (used for logging).
 * @throws When not able to find a moonpie entry of the user or the database
 * fails.
 * @returns A moonpie leaderboard entry.
 */
export const getEntry = async (
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
  if ((await existsEntry(databasePath, twitchId, logger)) === false) {
    throw Error(MoonpieDbError.NOT_EXISTING);
  }

  const runResult = await db.requests.getEach<GetMoonpieLeaderboardDbOut>(
    databasePath,
    db.queries.select(
      moonpieLeaderboardView.name,
      [
        {
          alias: "count",
          columnName: moonpieLeaderboardView.columns.moonpieCount.columnName,
        },
        {
          alias: "name",
          columnName: moonpieLeaderboardView.columns.twitchName.columnName,
        },
        {
          alias: "rank",
          columnName:
            moonpieLeaderboardView.columns.rank.alias !== undefined
              ? moonpieLeaderboardView.columns.rank.alias
              : moonpieLeaderboardView.columns.rank.columnName,
        },
      ],
      {
        whereColumns: {
          columnName: moonpieLeaderboardView.columns.twitchId.columnName,
        },
      }
    ),
    [twitchId],
    logMethod
  );
  if (runResult) {
    return runResult;
  }
  throw Error(MoonpieDbError.NOT_FOUND);
};
