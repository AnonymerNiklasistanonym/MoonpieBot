// Package imports
import db from "sqlite3-promise-query-api";
// Type imports
import type { DbVersionInfo } from "./genericVersionDb";
import type { SqliteTable } from "sqlite3-promise-query-api";

/**
 * The SQLite table for custom commands.
 */
export const customCommandsTable: Readonly<
  SqliteTable<
    | "cooldownInS"
    | "count"
    | "description"
    | "id"
    | "message"
    | "regex"
    | "timestampLastExecution"
    | "userLevel"
  >
> = {
  columns: {
    /** The time between the command can be used. */
    cooldownInS: {
      name: "cooldown_in_s",
      options: { default: 0, notNull: true },
      type: db.queries.CreateTableColumnType.INTEGER,
    },
    /** The amount of times the command was used. */
    count: {
      name: "count",
      options: { default: 0, notNull: true },
      type: db.queries.CreateTableColumnType.INTEGER,
    },
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
    /** The timestamp of the last command execution. */
    timestampLastExecution: {
      name: "timestamp_last_execution",
      type: db.queries.CreateTableColumnType.INTEGER,
    },
    /** The user level for what messages can use this command. */
    userLevel: {
      name: "user_level",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "custom_commands",
};

/**
 * The SQLite table for custom data for custom commands and broadcasts.
 */
export const customDataTable: Readonly<
  SqliteTable<"id" | "description" | "value" | "valueType">
> = {
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
    /** The value type of the custom data (number, string, string_list). */
    valueType: {
      name: "value_type",
      options: { notNull: true },
      type: db.queries.CreateTableColumnType.TEXT,
    },
  },
  name: "custom_data",
};

/**
 * The SQLite table for custom broadcasts.
 */
export const customBroadcastsTable: Readonly<
  SqliteTable<"cronString" | "description" | "id" | "message">
> = {
  columns: {
    /** The cron string that is used to determine when the broadcast should be sent. */
    cronString: {
      name: "cron_string",
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
  name: "custom_broadcasts",
};

export const versionCurrent: Readonly<DbVersionInfo> = {
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
