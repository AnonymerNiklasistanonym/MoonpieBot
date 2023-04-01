// Package imports
import db from "sqlite3-promise-query-api";
// Relative imports
import {
  convertCustomDataDbStringToValue,
  convertCustomDataValueToDbString,
  convertCustomDataValueTypeStringToValueType,
  CustomDataValueType,
} from "../../../customCommandsBroadcasts/customData.mjs";
import {
  CustomCommandsBroadcastsDbError,
  customDataTable,
} from "../../../info/databases/customCommandsBroadcastsDb.mjs";
import { createLogMethod } from "../../logging.mjs";
// Type imports
import type { ExistsDbOut, UpdateColumn } from "sqlite3-promise-query-api";
import type { CustomDataTypes } from "../../../customCommandsBroadcasts/customData.mjs";
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
  const logMethod = createLogMethod(logger, "database_custom_data_exists");
  try {
    const runResultExists = await db.default.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.default.queries.exists(customDataTable.name, {
        columnName: customDataTable.columns.id.name,
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
  description?: string;
  id: string;
  value: string | number | string[] | number[];
  valueType: CustomDataValueType;
}

export const createEntry = async (
  databasePath: string,
  input: CreateInput,
  logger: Readonly<Logger>
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_custom_data_create");
  const columns = [
    customDataTable.columns.id.name,
    customDataTable.columns.value.name,
    customDataTable.columns.valueType.name,
  ];
  const values: string[] = [
    input.id,
    convertCustomDataValueToDbString(input.value, input.valueType),
    input.valueType,
  ];
  if (input.description !== undefined) {
    columns.push(customDataTable.columns.description.name);
    values.push(input.description);
  }
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.insert(customDataTable.name, columns),
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
  const logMethod = createLogMethod(logger, "database_custom_data_remove");
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.remove(customDataTable.name, {
      columnName: customDataTable.columns.id.name,
    }),
    [input.id],
    logMethod
  );
  return postResult.changes > 0;
};

// Get entries
// -----------------------------------------------------------------------------

interface GetCustomDataDbOut {
  description: string | null;
  id: string;
  value: string;
  valueType: string;
}

export interface GetInput {
  id: string;
}

const mapGetCustomDataDbOutToResult = (
  input: GetCustomDataDbOut
): CustomDataTypes => {
  const valueType = convertCustomDataValueTypeStringToValueType(
    input.valueType
  );
  const description = input.description || undefined;
  switch (valueType) {
    case CustomDataValueType.NUMBER:
      return {
        ...input,
        description,
        value: convertCustomDataDbStringToValue(
          input.value,
          valueType
        ) as number,
        valueType,
      };
    case CustomDataValueType.NUMBER_LIST:
      return {
        ...input,
        description,
        value: convertCustomDataDbStringToValue(
          input.value,
          valueType
        ) as number[],
        valueType,
      };
    case CustomDataValueType.STRING:
      return {
        ...input,
        description,
        value: convertCustomDataDbStringToValue(
          input.value,
          valueType
        ) as string,
        valueType,
      };
    case CustomDataValueType.STRING_LIST:
      return {
        ...input,
        description,
        value: convertCustomDataDbStringToValue(
          input.value,
          valueType
        ) as string[],
        valueType,
      };
  }
};

export const getEntry = async (
  databasePath: string,
  input: GetInput,
  logger: Readonly<Logger>
): Promise<CustomDataTypes> => {
  const logMethod = createLogMethod(logger, "database_custom_data_get_entry");

  const runResult = await db.default.requests.getEach<GetCustomDataDbOut>(
    databasePath,
    db.default.queries.select(
      customDataTable.name,
      [
        {
          alias: "description",
          columnName: customDataTable.columns.description.name,
        },
        {
          alias: "id",
          columnName: customDataTable.columns.id.name,
        },
        {
          alias: "value",
          columnName: customDataTable.columns.value.name,
        },
        {
          alias: "valueType",
          columnName: customDataTable.columns.valueType.name,
        },
      ],
      {
        whereColumns: {
          columnName: customDataTable.columns.id.name,
        },
      }
    ),
    [input.id],
    logMethod
  );
  if (runResult) {
    return mapGetCustomDataDbOutToResult(runResult);
  }
  throw Error(CustomCommandsBroadcastsDbError.NOT_FOUND);
};

export const getEntries = async (
  databasePath: string,
  logger: Readonly<Logger>
): Promise<CustomDataTypes[]> => {
  const logMethod = createLogMethod(logger, "database_custom_data_get_entry");

  const runResult = await db.default.requests.getAll<GetCustomDataDbOut>(
    databasePath,
    db.default.queries.select(customDataTable.name, [
      {
        alias: "description",
        columnName: customDataTable.columns.description.name,
      },
      {
        alias: "id",
        columnName: customDataTable.columns.id.name,
      },
      {
        alias: "value",
        columnName: customDataTable.columns.value.name,
      },
      {
        alias: "valueType",
        columnName: customDataTable.columns.valueType.name,
      },
    ]),
    undefined,
    logMethod
  );
  if (runResult) {
    return runResult.map((a) => mapGetCustomDataDbOutToResult(a));
  }
  throw Error(CustomCommandsBroadcastsDbError.NOT_FOUND);
};

// Update entries
// -----------------------------------------------------------------------------

export interface UpdateInput {
  description?: string;
  id: string;
  value: string | number | string[] | number[];
  valueType: CustomDataValueType;
}

export interface UpdateInputNumber {
  description?: string;
  id: string;
  valueDecrease: number;
  valueIncrease: number;
  valueType: CustomDataValueType.NUMBER;
}

export const updateEntry = async (
  databasePath: string,
  input:
    | UpdateInput
    | Omit<UpdateInputNumber, "valueIncrease">
    | Omit<UpdateInputNumber, "valueDecrease">,
  logger: Readonly<Logger>
): Promise<number> => {
  const logMethod = createLogMethod(logger, "database_custom_data_update");
  // Special validations for DB entry request
  // > Check if entry already exists
  if ((await existsEntry(databasePath, input, logger)) === false) {
    throw Error(CustomCommandsBroadcastsDbError.NOT_EXISTING);
  }

  const columns: (string | UpdateColumn)[] = [
    customDataTable.columns.valueType.name,
  ];
  const values: (string | number)[] = [input.valueType];
  if ("valueDecrease" in input) {
    columns.push({
      columnName: customDataTable.columns.value.name,
      operator: "-=",
    });
    values.push(input.valueDecrease);
  } else if ("valueIncrease" in input) {
    columns.push({
      columnName: customDataTable.columns.value.name,
      operator: "+=",
    });
    values.push(input.valueIncrease);
  } else {
    columns.push(customDataTable.columns.value.name);
    values.push(convertCustomDataValueToDbString(input.value, input.valueType));
  }
  if (input.description !== undefined) {
    columns.push(customDataTable.columns.description.name);
    values.push(input.description);
  }
  const postResult = await db.default.requests.post(
    databasePath,
    db.default.queries.update(customDataTable.name, columns, {
      columnName: customDataTable.columns.id.name,
    }),
    [...values, input.id],
    logMethod
  );
  return postResult.changes;
};
