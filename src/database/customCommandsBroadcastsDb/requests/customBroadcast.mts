// Package imports
import db from "sqlite3-promise-query-api";
// Relative imports
import {
  customBroadcastsTable,
  CustomCommandsBroadcastsDbError,
} from "../../../info/databases/customCommandsBroadcastsDb.mjs";
import { createLogMethod } from "../../logging.mjs";
// Type imports
import type { CustomBroadcast } from "../../../customCommandsBroadcasts/customBroadcast.mjs";
import type { ExistsDbOut } from "sqlite3-promise-query-api";
import type { Logger } from "winston";

// Exists/Create/Remove entries
// -----------------------------------------------------------------------------

export interface ExistsInput {
  id: string;
}

export const existsEntry = async (
  databasePath: string,
  input: ExistsInput,
  logger: Readonly<Logger>
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_custom_broadcast_exists");
  try {
    const runResultExists = await db.default.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.default.queries.exists(customBroadcastsTable.name, {
        columnName: customBroadcastsTable.columns.id.name,
      }),
      [input.id],
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

export interface CreateInput {
  cronString: string;
  description?: string;
  id: string;
  message: string;
}

export const createEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Readonly<Logger>
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_custom_broadcast_create");
  const columns = [
    customBroadcastsTable.columns.id.name,
    customBroadcastsTable.columns.message.name,
    customBroadcastsTable.columns.cronString.name,
  ];
  const values = [input.id, input.message, input.cronString];
  if (input.description !== undefined) {
    columns.push(customBroadcastsTable.columns.description.name);
    values.push(input.description);
  }
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.insert(customBroadcastsTable.name, columns),
    values,
    logMethod
  );
  return postResult.lastID;
};

export interface RemoveInput {
  id: string;
}

export const removeEntry = async (
  databasePath: string,
  input: RemoveInput,
  logger: Readonly<Logger>
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_custom_broadcast_remove");
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.remove(customBroadcastsTable.name, {
      columnName: customBroadcastsTable.columns.id.name,
    }),
    [input.id],
    logMethod
  );
  return postResult.changes > 0;
};

// Get entries
// -----------------------------------------------------------------------------

interface GetCustomCommandDbOut {
  cronString: string;
  description: string | null;
  id: string;
  message: string;
}

export const getEntries = async (
  databasePath: string,
  offset: number | undefined,
  logger: Readonly<Logger>
): Promise<CustomBroadcast[]> => {
  const logMethod = createLogMethod(
    logger,
    "database_custom_broadcast_get_entries"
  );

  const runResult = await db.default.requests.getAll<GetCustomCommandDbOut>(
    databasePath,
    db.default.queries.select(
      customBroadcastsTable.name,
      [
        {
          alias: "cronString",
          columnName: customBroadcastsTable.columns.cronString.name,
        },
        {
          alias: "description",
          columnName: customBroadcastsTable.columns.description.name,
        },
        {
          alias: "id",
          columnName: customBroadcastsTable.columns.id.name,
        },
        {
          alias: "message",
          columnName: customBroadcastsTable.columns.message.name,
        },
      ],
      offset !== undefined
        ? {
            limit: 5,
            limitOffset: offset,
          }
        : undefined
    ),
    undefined,
    logMethod
  );
  if (runResult) {
    return runResult.map((a) => ({
      ...a,
      description: a.description || undefined,
    }));
  }
  throw Error(CustomCommandsBroadcastsDbError.NOT_FOUND);
};

export interface GetInput {
  id: string;
}

export const getEntry = async (
  databasePath: string,
  input: GetInput,
  logger: Readonly<Logger>
): Promise<CustomBroadcast> => {
  const logMethod = createLogMethod(
    logger,
    "database_custom_broadcast_get_entry"
  );

  const runResult = await db.default.requests.getEach<GetCustomCommandDbOut>(
    databasePath,
    db.default.queries.select(
      customBroadcastsTable.name,
      [
        {
          alias: "cronString",
          columnName: customBroadcastsTable.columns.cronString.name,
        },
        {
          alias: "description",
          columnName: customBroadcastsTable.columns.description.name,
        },
        {
          alias: "id",
          columnName: customBroadcastsTable.columns.id.name,
        },
        {
          alias: "message",
          columnName: customBroadcastsTable.columns.message.name,
        },
      ],
      {
        whereColumns: {
          columnName: customBroadcastsTable.columns.id.name,
        },
      }
    ),
    [input.id],
    logMethod
  );
  if (runResult) {
    return {
      ...runResult,
      description:
        runResult.description !== null ? runResult.description : undefined,
    };
  }
  throw Error(CustomCommandsBroadcastsDbError.NOT_FOUND);
};

// Update entries
// -----------------------------------------------------------------------------

export interface UpdateInput {
  cronString?: string;
  description?: string;
  id: string;
  idNew?: string;
  message?: string;
}

export const updateEntry = async (
  databasePath: string,
  input: UpdateInput,
  logger: Readonly<Logger>
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_custom_broadcast_update");
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await existsEntry(databasePath, input, logger)) === false) {
    throw Error(CustomCommandsBroadcastsDbError.NOT_EXISTING);
  }

  const columns: string[] = [];
  const values: string[] = [];
  if (input.cronString !== undefined) {
    columns.push(customBroadcastsTable.columns.cronString.name);
    values.push(input.cronString);
  }
  if (input.description !== undefined) {
    columns.push(customBroadcastsTable.columns.description.name);
    values.push(input.description);
  }
  if (input.message !== undefined) {
    columns.push(customBroadcastsTable.columns.message.name);
    values.push(input.message);
  }
  if (input.idNew !== undefined) {
    columns.push(customBroadcastsTable.columns.id.name);
    values.push(input.idNew);
  }
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.update(customBroadcastsTable.name, columns, {
      columnName: customBroadcastsTable.columns.id.name,
    }),
    [...values, input.id],
    logMethod
  );
  return postResult.changes;
};
