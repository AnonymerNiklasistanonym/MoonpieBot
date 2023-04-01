// Package imports
import db from "sqlite3-promise-query-api";
// Type imports
import type { SqliteTable } from "sqlite3-promise-query-api";

/**
 * The SQLite table for storing the database version for migrations.
 */
export const versionTable: Readonly<SqliteTable<"major" | "minor" | "patch">> =
  {
    columns: {
      major: {
        name: "major",
        options: { notNull: true, primaryKey: true },
        type: db.default.queries.CreateTableColumnType.INTEGER,
      },
      minor: {
        name: "minor",
        options: { notNull: true, primaryKey: true },
        type: db.default.queries.CreateTableColumnType.INTEGER,
      },
      patch: {
        name: "patch",
        options: { notNull: true, primaryKey: true },
        type: db.default.queries.CreateTableColumnType.INTEGER,
      },
    },
    name: "version",
  };

/** Errors that can happen during version requests. */
export enum DbVersionRequestError {
  NOT_FOUND = "VERSION_NOT_FOUND",
}

export interface DbVersionInfo {
  major: number;
  minor: number;
  patch: number;
}
