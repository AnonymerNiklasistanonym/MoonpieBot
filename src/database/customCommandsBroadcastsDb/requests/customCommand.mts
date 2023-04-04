// Package imports
import db from "sqlite3-promise-query-api";
// Relative imports
import {
  convertTwitchBadgeLevelToString,
  convertTwitchBadgeStringToLevel,
  TwitchBadgeLevel,
} from "../../../twitch.mjs";
import {
  CustomCommandsBroadcastsDbError,
  customCommandsTable,
} from "../../../info/databases/customCommandsBroadcastsDb.mjs";
import { createLogMethod } from "../../logging.mjs";
// Type imports
import type { ExistsDbOut, UpdateColumn } from "sqlite3-promise-query-api";
import type { CustomCommand } from "../../../customCommandsBroadcasts/customCommand.mjs";
import type { Logger } from "winston";

// Exists/Create/Remove entries
// -----------------------------------------------------------------------------

export interface ExistsInput {
  id: string;
}

export const existsEntry = async (
  databasePath: string,
  input: ExistsInput,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_custom_command_exists");
  try {
    const runResultExists = await db.default.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.default.queries.exists(customCommandsTable.name, {
        columnName: customCommandsTable.columns.id.name,
      }),
      [input.id],
      logMethod,
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
  cooldownInS?: number;
  count?: number;
  description?: string;
  id: string;
  message: string;
  regex: string;
  userLevel?: TwitchBadgeLevel;
}

export const createEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Readonly<Logger>,
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_custom_command_create");
  const columns = [
    customCommandsTable.columns.id.name,
    customCommandsTable.columns.message.name,
    customCommandsTable.columns.regex.name,
    customCommandsTable.columns.userLevel.name,
  ];
  const values: (string | number)[] = [
    input.id,
    input.message,
    input.regex,
    convertTwitchBadgeLevelToString(
      input.userLevel !== undefined ? input.userLevel : TwitchBadgeLevel.NONE,
    ),
  ];
  if (input.cooldownInS !== undefined) {
    columns.push(customCommandsTable.columns.cooldownInS.name);
    values.push(input.cooldownInS);
  }
  if (input.count !== undefined) {
    columns.push(customCommandsTable.columns.count.name);
    values.push(input.count);
  }
  if (input.description !== undefined) {
    columns.push(customCommandsTable.columns.description.name);
    values.push(input.description);
  }
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.insert(customCommandsTable.name, columns),
    values,
    logMethod,
  );
  return postResult.lastID;
};

export interface RemoveInput {
  id: string;
}

export const removeEntry = async (
  databasePath: string,
  input: RemoveInput,
  logger: Readonly<Logger>,
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_custom_command_remove");
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.remove(customCommandsTable.name, {
      columnName: customCommandsTable.columns.id.name,
    }),
    [input.id],
    logMethod,
  );
  return postResult.changes > 0;
};

// Get entries
// -----------------------------------------------------------------------------

interface GetCustomCommandDbOut {
  cooldownInS: number;
  count: number;
  description: string | null;
  id: string;
  message: string;
  regex: string;
  timestampLastExecution: number | null;
  userLevel: string;
}

export const getEntries = async (
  databasePath: string,
  offset: number | undefined,
  logger: Readonly<Logger>,
): Promise<CustomCommand[]> => {
  const logMethod = createLogMethod(
    logger,
    "database_custom_command_get_entries",
  );

  const runResult = await db.default.requests.getAll<GetCustomCommandDbOut>(
    databasePath,
    db.default.queries.select(
      customCommandsTable.name,
      [
        {
          alias: "cooldownInS",
          columnName: customCommandsTable.columns.cooldownInS.name,
        },
        {
          alias: "count",
          columnName: customCommandsTable.columns.count.name,
        },
        {
          alias: "description",
          columnName: customCommandsTable.columns.description.name,
        },
        {
          alias: "id",
          columnName: customCommandsTable.columns.id.name,
        },
        {
          alias: "message",
          columnName: customCommandsTable.columns.message.name,
        },
        {
          alias: "regex",
          columnName: customCommandsTable.columns.regex.name,
        },
        {
          alias: "timestampLastExecution",
          columnName: customCommandsTable.columns.timestampLastExecution.name,
        },
        {
          alias: "userLevel",
          columnName: customCommandsTable.columns.userLevel.name,
        },
      ],
      offset !== undefined
        ? {
            limit: 5,
            limitOffset: offset,
          }
        : undefined,
    ),
    undefined,
    logMethod,
  );
  return runResult.map((a) => ({
    ...a,
    description: a.description ?? undefined,
    timestampLastExecution: a.timestampLastExecution ?? undefined,
    userLevel: convertTwitchBadgeStringToLevel(a.userLevel),
  }));
};

export interface GetInput {
  id: string;
}

export const getEntry = async (
  databasePath: string,
  input: GetInput,
  logger: Readonly<Logger>,
): Promise<CustomCommand> => {
  const logMethod = createLogMethod(
    logger,
    "database_custom_command_get_entry",
  );

  const runResult = await db.default.requests.getEach<GetCustomCommandDbOut>(
    databasePath,
    db.default.queries.select(
      customCommandsTable.name,
      [
        {
          alias: "cooldownInS",
          columnName: customCommandsTable.columns.cooldownInS.name,
        },
        {
          alias: "count",
          columnName: customCommandsTable.columns.count.name,
        },
        {
          alias: "description",
          columnName: customCommandsTable.columns.description.name,
        },
        {
          alias: "id",
          columnName: customCommandsTable.columns.id.name,
        },
        {
          alias: "message",
          columnName: customCommandsTable.columns.message.name,
        },
        {
          alias: "regex",
          columnName: customCommandsTable.columns.regex.name,
        },
        {
          alias: "timestampLastExecution",
          columnName: customCommandsTable.columns.timestampLastExecution.name,
        },
        {
          alias: "userLevel",
          columnName: customCommandsTable.columns.userLevel.name,
        },
      ],
      {
        whereColumns: {
          columnName: customCommandsTable.columns.id.name,
        },
      },
    ),
    [input.id],
    logMethod,
  );
  if (runResult) {
    return {
      ...runResult,
      description: runResult.description ?? undefined,
      timestampLastExecution: runResult.timestampLastExecution ?? undefined,
      userLevel: convertTwitchBadgeStringToLevel(runResult.userLevel),
    };
  }
  throw Error(CustomCommandsBroadcastsDbError.NOT_FOUND);
};

// Update entries
// -----------------------------------------------------------------------------

export interface UpdateInput {
  cooldownInS?: number;
  countIncrease?: number;
  countNew?: number;
  description?: string;
  id: string;
  idNew?: string;
  message?: string;
  regex?: string;
  timestampLastExecution?: number;
  userLevel?: TwitchBadgeLevel;
}

export const updateEntry = async (
  databasePath: string,
  input: Omit<UpdateInput, "countIncrease"> | Omit<UpdateInput, "countNew">,
  logger: Readonly<Logger>,
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_custom_command_update");
  // Special validations for DB entry request
  // > Check if entry already exists
  if (!(await existsEntry(databasePath, input, logger))) {
    throw Error(CustomCommandsBroadcastsDbError.NOT_EXISTING);
  }

  const columns: (string | UpdateColumn)[] = [];
  const values: (string | number)[] = [];
  if (input.cooldownInS !== undefined) {
    columns.push(customCommandsTable.columns.cooldownInS.name);
    values.push(input.cooldownInS);
  }
  if ("countNew" in input && input.countNew !== undefined) {
    columns.push(customCommandsTable.columns.count.name);
    values.push(input.countNew);
  } else if ("countIncrease" in input && input.countIncrease !== undefined) {
    columns.push({
      columnName: customCommandsTable.columns.count.name,
      operator: "+=",
    });
    values.push(input.countIncrease);
  }
  if (input.description !== undefined) {
    columns.push(customCommandsTable.columns.description.name);
    values.push(input.description);
  }
  if (input.idNew !== undefined) {
    columns.push(customCommandsTable.columns.id.name);
    values.push(input.idNew);
  }
  if (input.message !== undefined) {
    columns.push(customCommandsTable.columns.message.name);
    values.push(input.message);
  }
  if (input.regex !== undefined) {
    columns.push(customCommandsTable.columns.regex.name);
    values.push(input.regex);
  }
  if (input.timestampLastExecution !== undefined) {
    columns.push(customCommandsTable.columns.timestampLastExecution.name);
    values.push(input.timestampLastExecution);
  }
  if (input.userLevel !== undefined) {
    columns.push(customCommandsTable.columns.userLevel.name);
    values.push(convertTwitchBadgeLevelToString(input.userLevel));
  }
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.update(customCommandsTable.name, columns, {
      columnName: customCommandsTable.columns.id.name,
    }),
    [...values, input.id],
    logMethod,
  );
  return postResult.changes;
};
