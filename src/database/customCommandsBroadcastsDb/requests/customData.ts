// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import {
  convertCustomDataDbStringToValue,
  convertCustomDataValueToDbString,
  convertCustomDataValueTypeStringToValueType,
  CustomDataValueType,
} from "../../../customCommandsBroadcasts/customData";
import {
  CustomCommandsBroadcastsDbError,
  customDataTable,
} from "../../../info/databases/customCommandsBroadcastsDb";
import { createLogMethod } from "../../logging";
// Type imports
import type { ExistsDbOut, UpdateColumn } from "sqlite3-promise-query-api";
import type { CustomDataTypes } from "../../../customCommandsBroadcasts/customData";
import type { Logger } from "winston";

// Exists/Create/Remove entries
// -----------------------------------------------------------------------------

export interface ExistsInput {
  id: string;
}

export const existsEntry = async (
  databasePath: string,
  input: ExistsInput,
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_custom_data_exists");
  try {
    const runResultExists = await db.requests.getEach<ExistsDbOut>(
      databasePath,
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      db.queries.exists(customDataTable.name, {
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
  logger: Logger
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
  const postResult = await db.requests.post(
    databasePath,
    db.queries.insert(customDataTable.name, columns),
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
  logger: Logger
): Promise<boolean> => {
  const logMethod = createLogMethod(logger, "database_custom_data_remove");
  const postResult = await db.requests.post(
    databasePath,
    db.queries.remove(customDataTable.name, {
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

export const getEntry = async (
  databasePath: string,
  input: GetInput,
  logger: Logger
): Promise<CustomDataTypes> => {
  const logMethod = createLogMethod(logger, "database_custom_data_get_entry");

  const runResult = await db.requests.getEach<GetCustomDataDbOut>(
    databasePath,
    db.queries.select(
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
    const valueType = convertCustomDataValueTypeStringToValueType(
      runResult.valueType
    );
    const description =
      runResult.description !== null ? runResult.description : undefined;
    switch (valueType) {
      case CustomDataValueType.NUMBER:
        return {
          ...runResult,
          description,
          value: convertCustomDataDbStringToValue(
            runResult.value,
            valueType
          ) as number,
          valueType,
        };
      case CustomDataValueType.NUMBER_LIST:
        return {
          ...runResult,
          description,
          value: convertCustomDataDbStringToValue(
            runResult.value,
            valueType
          ) as number[],
          valueType,
        };
      case CustomDataValueType.STRING:
        return {
          ...runResult,
          description,
          value: convertCustomDataDbStringToValue(
            runResult.value,
            valueType
          ) as string,
          valueType,
        };
      case CustomDataValueType.STRING_LIST:
        return {
          ...runResult,
          description,
          value: convertCustomDataDbStringToValue(
            runResult.value,
            valueType
          ) as string[],
          valueType,
        };
    }
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
  logger: Logger
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
  const postResult = await db.requests.post(
    databasePath,
    db.queries.update(customDataTable.name, columns, {
      columnName: customDataTable.columns.id.name,
    }),
    [...values, input.id],
    logMethod
  );
  return postResult.changes;
};
