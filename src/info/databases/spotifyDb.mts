// Package imports
import db from "sqlite3-promise-query-api";
// Type imports
import type { DbVersionInfo } from "./genericVersionDb.mjs";
import type { SqliteTable } from "sqlite3-promise-query-api";

/**
 * The SQLite table for spotify configuration information.
 */
export const spotifyConfigTable: Readonly<
  SqliteTable<"option" | "optionValue">
> = {
  columns: {
    option: {
      name: "option",
      options: { notNull: true, primaryKey: true, unique: true },
      type: db.default.queries.CreateTableColumnType.TEXT,
    },
    optionValue: {
      name: "option_value",
      options: { notNull: true },
      type: db.default.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "spotify_config",
};

export const versionCurrent: Readonly<DbVersionInfo> = {
  major: 0,
  minor: 0,
  patch: 1,
};

/** Errors that can happen during moonpie requests. */
export enum SpotifyDbError {
  NOT_EXISTING = "SPOTIFY_CONFIG_NOT_EXISTING",
  NOT_FOUND = "SPOTIFY_CONFIG_NOT_FOUND",
  NO_ACCESS = "SPOTIFY_CONFIG_NO_ACCESS",
}
