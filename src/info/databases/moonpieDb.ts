// Package imports
import db from "sqlite3-promise-query-api";
// Type imports
import type {
  SqliteIndex,
  SqliteTable,
  SqliteView,
} from "sqlite3-promise-query-api";
import type { DbVersionInfo } from "./genericVersionDb";

/**
 * The SQLite table for moonpies.
 * It contains the timestamp and the count of the last moonpie claim
 * and a unique Twitch ID as the primary key as well as the current name
 * of the Twitch account.
 */
export const moonpieTable: Readonly<
  SqliteTable<"date" | "moonpieCount" | "twitchId" | "twitchName">
> = {
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
      options: { notNull: true, primaryKey: true },
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
};

/**
 * The SQLite view for moonpie counts over the moonpie table.
 * This view exists so the current rank across all entries can be provided
 * as well as a leaderboard. The view can be used just like a normal table
 * but is read only and improves performance by a lot since sorting the
 * table is not necessary any more.
 */
export const moonpieLeaderboardView: Readonly<
  SqliteView<"moonpieCount" | "rank" | "twitchId" | "twitchName">
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
        { ascending: false, column: moonpieTable.columns.moonpieCount.name },
        { ascending: true, column: moonpieTable.columns.date.name },
        { ascending: true, column: moonpieTable.columns.twitchName.name },
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
  options: {
    orderBy: [
      {
        ascending: false,
        column: moonpieTable.columns.moonpieCount.name,
      },
      {
        ascending: true,
        column: moonpieTable.columns.date.name,
      },
      {
        ascending: true,
        column: moonpieTable.columns.twitchName.name,
      },
    ],
  },
  tableName: moonpieTable.name,
};

export const moonpieCountIndex: Readonly<SqliteIndex> = {
  columns: [moonpieTable.columns.moonpieCount.name],
  name: "index_moonpie_count",
  tableName: moonpieTable.name,
};

export const versionCurrent: Readonly<DbVersionInfo> = {
  major: 0,
  minor: 0,
  patch: 2,
};

/** Errors that can happen during requests. */
export enum MoonpieDbError {
  ALREADY_EXISTS = "MOONPIE_ALREADY_EXISTS",
  NOT_EXISTING = "MOONPIE_NOT_EXISTING",
  NOT_FOUND = "MOONPIE_NOT_FOUND",
  NO_ACCESS = "MOONPIE_NO_ACCESS",
}
