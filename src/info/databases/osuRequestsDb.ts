// Package imports
import db from "sqlite3-promise-query-api";
// Type imports
import type { DbVersionInfo } from "./genericVersionDb";
import type { SqliteTable } from "sqlite3-promise-query-api";

/**
 * The SQLite table for osu requests configuration information.
 */
export const osuRequestsConfigTable: Readonly<
  SqliteTable<"option" | "optionValue">
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
  },
  name: "osu_requests_config",
};
export const osuRequestsConfigTableV001: Readonly<
  SqliteTable<"option" | "optionValue" | "twitchChannel">
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

export const versionCurrent: Readonly<DbVersionInfo> = {
  major: 0,
  minor: 0,
  patch: 3,
};

/** Errors that can happen during requests. */
export enum OsuRequestsDbError {
  NOT_EXISTING = "OSU_REQUESTS_CONFIG_NOT_EXISTING",
  NOT_FOUND = "OSU_REQUESTS_CONFIG_NOT_FOUND",
  NO_ACCESS = "OSU_REQUESTS_CONFIG_NO_ACCESS",
}
/**
 * All possible requests configuration options (It's in this file in case of
 * changes are being made so that a migration can be done).
 */
export enum OsuRequestsConfig {
  AR_MAX = "arMax",
  AR_MIN = "arMin",
  CS_MAX = "csMax",
  CS_MIN = "csMin",
  DETAILED = "detailed",
  DETAILED_IRC = "detailedIrc",
  ENABLED = "enabled",
  LENGTH_IN_MIN_MAX = "lengthInMinMax",
  LENGTH_IN_MIN_MIN = "lengthInMinMin",
  MESSAGE = "message",
  REDEEM_ID = "redeemId",
  STAR_MAX = "starMax",
  STAR_MIN = "starMin",
}
export enum OsuRequestsConfigV002 {
  AR_MAX = "arMax",
  AR_MIN = "arMin",
  CS_MAX = "csMax",
  CS_MIN = "csMin",
  DETAILED = "detailed",
  DETAILED_IRC = "detailedIrc",
  LENGTH_IN_MIN_MAX = "lengthInMinMax",
  LENGTH_IN_MIN_MIN = "lengthInMinMin",
  MESSAGE_OFF = "messageOff",
  MESSAGE_ON = "messageOn",
  REDEEM_ID = "redeemId",
  STAR_MAX = "starMax",
  STAR_MIN = "starMin",
}
