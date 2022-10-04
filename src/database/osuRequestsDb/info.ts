// Package imports
import db from "sqlite3-promise-query-api";
// Type imports
import type { SqliteTable } from "sqlite3-promise-query-api";

/**
 * The SQLite table for osu requests configuration information.
 */
export const osuRequestsConfigTable: SqliteTable<"option" | "optionValue"> = {
  columns: {
    option: {
      name: "option",
      options: { notNull: true, primaryKey: true, unique: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    optionValue: {
      name: "option_value",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "osu_requests_config",
};

export const osuRequestsConfigTableV001: SqliteTable<
  "option" | "optionValue" | "twitchChannel"
> = {
  columns: {
    option: {
      name: "option",
      options: { notNull: true, primaryKey: true, unique: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    optionValue: {
      name: "option_value",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    twitchChannel: {
      name: "twitch_channel",
      options: { notNull: true, primaryKey: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "osu_requests_config",
};

export const versionCurrent = {
  major: 0,
  minor: 0,
  patch: 2,
};

/** Errors that can happen during requests. */
export enum OsuRequestsDbError {
  NOT_EXISTING = "OSU_REQUESTS_CONFIG_NOT_EXISTING",
  NOT_FOUND = "OSU_REQUESTS_CONFIG_NOT_FOUND",
  NO_ACCESS = "OSU_REQUESTS_CONFIG_NO_ACCESS",
}
