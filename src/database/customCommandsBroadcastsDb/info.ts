// Package imports
import db from "sqlite3-promise-query-api";
// Type imports
import type { SqliteTable } from "sqlite3-promise-query-api";

/**
 * The SQLite table for custom commands.
 */
export const customCommandsTable: SqliteTable<
  "description" | "id" | "message" | "regex" | "userLevel"
> = {
  columns: {
    /** An optional description. */
    description: {
      name: "description",
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The unique ID of each custom command. */
    id: {
      name: "id",
      options: { notNull: true, primaryKey: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The message that is being sent to chat in case the custom command is detected. */
    message: {
      name: "message",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The regex that detects the custom command. */
    regex: {
      name: "regex",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The user level for what messages can use this command. */
    userLevel: {
      name: "userlevel",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "customcommands",
};

/**
 * The SQLite table for custom data for custom commands and broadcasts.
 */
export const customDataTable: SqliteTable<"id" | "description" | "value"> = {
  columns: {
    /** An optional description. */
    description: {
      name: "description",
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The unique ID of each custom data. */
    id: {
      name: "id",
      options: { notNull: true, primaryKey: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The value of the custom data. */
    value: {
      name: "value",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "customdata",
};

/**
 * The SQLite table for custom broadcasts.
 */
export const customBroadcastsTable: SqliteTable<
  "cronString" | "description" | "id" | "message"
> = {
  columns: {
    /** The cron string that is used to determine when the broadcast should be sent. */
    cronString: {
      name: "cronstring",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** An optional description. */
    description: {
      name: "description",
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The unique ID of each custom command (only unique for each channel). */
    id: {
      name: "id",
      options: { notNull: true, primaryKey: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
    /** The message that is being sent to chat in case the custom command is detected. */
    message: {
      name: "message",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "custombroadcasts",
};

export const versionCurrent = {
  major: 0,
  minor: 0,
  patch: 1,
};

/** Errors that can happen during requests. */
export enum CustomCommandsBroadcastsDbError {
  ALREADY_EXISTS = "CUSTOM_COMMANDS_BROADCASTS_ALREADY_EXISTS",
  NOT_EXISTING = "CUSTOM_COMMANDS_BROADCASTS_NOT_EXISTING",
  NOT_FOUND = "CUSTOM_COMMANDS_BROADCASTS_NOT_FOUND",
  NO_ACCESS = "CUSTOM_COMMANDS_BROADCASTS_NO_ACCESS",
}
