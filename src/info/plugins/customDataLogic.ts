// Local imports
import {
  convertCustomDataValueToDbString,
  CustomDataValueType,
} from "../../customCommandsBroadcasts/customData";
import {
  pluginCustomDataId,
  pluginCustomDataListAverageId,
  pluginCustomDataListClearId,
  pluginCustomDataListClearNumberId,
  pluginCustomDataListId,
  pluginCustomDataListMaxId,
  pluginCustomDataListMinId,
  pluginCustomDataListSizeId,
  pluginCustomDataListSumId,
} from "./customData";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
// Type imports
import type { Logger } from "winston";
import type { MessageParserPluginGenerator } from "../../messageParser";

enum CustomDataLogicOperator {
  ADD = "+=",
  ADD_NUMBER = "+#=",
  GET_OR_SET = "<>",
  GET_OR_SET_NUMBER = "<#>",
  REMOVE_NUMBER = "-#=",
  SET = "=",
  SET_NUMBER = "#=",
}
const customDataLogic = async (
  content: undefined | string,
  customCommandsBroadcastsDbPath: string,
  logger: Logger
): Promise<string> => {
  // Check if the content string has two elements, otherwise throw error
  if (content === undefined || content.trim().length === 0) {
    throw Error("Plugin argument was empty");
  }
  const operators = /.+?(?:\+=|\+#=|<>|<#>|-#=|=|#=).+?/;
  const operatorMatch = content.match(operators);
  if (operatorMatch === null) {
    throw Error(
      `Plugin argument format incorrect (it should be 'nameOPERATORvalue' [OPERATOR:=${Object.values(
        CustomDataLogicOperator
      ).join(",")}] and no supported operator was found in '${content.trim()}')`
    );
  }
  const operator = operatorMatch[1] as CustomDataLogicOperator;
  const args = content
    .trim()
    .split(operator)
    .map((a) => a.trim());
  if (args.length !== 2) {
    throw Error(
      `Plugin argument format incorrect (it should be 'nameOPERATORvalue' [OPERATOR:=${Object.values(
        CustomDataLogicOperator
      ).join(
        ","
      )}] and more/less than 2 elements were found '${content.trim()}'/${JSON.stringify(
        args
      )})`
    );
  }

  // Validate if the plugin value is correct
  switch (operator) {
    case CustomDataLogicOperator.ADD:
    case CustomDataLogicOperator.SET:
    case CustomDataLogicOperator.GET_OR_SET:
      break;
    case CustomDataLogicOperator.ADD_NUMBER:
    case CustomDataLogicOperator.GET_OR_SET_NUMBER:
    case CustomDataLogicOperator.REMOVE_NUMBER:
    case CustomDataLogicOperator.SET_NUMBER:
      if (isNaN(parseFloat(args[1]))) {
        throw Error(
          `Plugin value incorrect (a number was expected instead of '${content.trim()}')`
        );
      }
      break;
  }

  const exists =
    await customCommandsBroadcastsDb.requests.customData.existsEntry(
      customCommandsBroadcastsDbPath,
      { id: args[0] },
      logger
    );

  // Remove existing value if found
  if (
    operator === CustomDataLogicOperator.SET ||
    operator === CustomDataLogicOperator.SET_NUMBER
  ) {
    if (exists) {
      await customCommandsBroadcastsDb.requests.customData.removeEntry(
        customCommandsBroadcastsDbPath,
        { id: args[0] },
        logger
      );
    }
  }

  // Get entry
  let entry;
  switch (operator) {
    case CustomDataLogicOperator.ADD:
    case CustomDataLogicOperator.GET_OR_SET:
    case CustomDataLogicOperator.ADD_NUMBER:
    case CustomDataLogicOperator.GET_OR_SET_NUMBER:
    case CustomDataLogicOperator.REMOVE_NUMBER:
      if (exists) {
        entry = await customCommandsBroadcastsDb.requests.customData.getEntry(
          customCommandsBroadcastsDbPath,
          { id: args[0] },
          logger
        );
      }
      break;
    case CustomDataLogicOperator.SET:
    case CustomDataLogicOperator.SET_NUMBER:
      break;
  }

  switch (operator) {
    // All the operators that need information about existing values
    case CustomDataLogicOperator.ADD:
      if (entry === undefined) {
        await customCommandsBroadcastsDb.requests.customData.createEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value: args[1],
            valueType: CustomDataValueType.STRING,
          },
          logger
        );
        return args[1];
      } else if (typeof entry.value !== "string") {
        throw Error(
          `Plugin entry value was not a string ('${content.trim()}'/'${JSON.stringify(
            entry.value
          )}'/${entry.valueType})`
        );
      } else {
        await customCommandsBroadcastsDb.requests.customData.updateEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value: entry.value + args[1],
            valueType: CustomDataValueType.STRING,
          },
          logger
        );
        return entry.value + args[1];
      }
    case CustomDataLogicOperator.ADD_NUMBER:
    case CustomDataLogicOperator.REMOVE_NUMBER:
      if (entry === undefined) {
        await customCommandsBroadcastsDb.requests.customData.createEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value: CustomDataLogicOperator.ADD_NUMBER
              ? parseFloat(args[1])
              : -parseFloat(args[1]),
            valueType: CustomDataValueType.NUMBER,
          },
          logger
        );
        return args[1];
      } else if (typeof entry.value !== "number") {
        throw Error(
          `Plugin entry value was not a number ('${content.trim()}'/'${JSON.stringify(
            entry.value
          )}'/${entry.valueType})`
        );
      } else {
        const newValue =
          entry.value +
          (CustomDataLogicOperator.ADD_NUMBER
            ? parseFloat(args[1])
            : -parseFloat(args[1]));
        await customCommandsBroadcastsDb.requests.customData.updateEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value: newValue,
            valueType: CustomDataValueType.STRING,
          },
          logger
        );
        return `${newValue}`;
      }
    case CustomDataLogicOperator.GET_OR_SET:
    case CustomDataLogicOperator.GET_OR_SET_NUMBER:
      if (!exists) {
        await customCommandsBroadcastsDb.requests.customData.createEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value:
              operator === CustomDataLogicOperator.GET_OR_SET
                ? args[1]
                : parseFloat(args[1]),
            valueType:
              operator === CustomDataLogicOperator.GET_OR_SET_NUMBER
                ? CustomDataValueType.STRING
                : CustomDataValueType.NUMBER,
          },
          logger
        );
        return args[1];
      } else if (entry === undefined) {
        throw Error(`Plugin entry was undefined ('${content.trim()}')`);
      }
      return convertCustomDataValueToDbString(entry.value, entry.valueType);
    case CustomDataLogicOperator.SET:
    case CustomDataLogicOperator.SET_NUMBER:
      await customCommandsBroadcastsDb.requests.customData.createEntry(
        customCommandsBroadcastsDbPath,
        {
          id: args[0],
          value:
            operator === CustomDataLogicOperator.SET
              ? args[1]
              : parseFloat(args[1]),
          valueType:
            operator === CustomDataLogicOperator.SET
              ? CustomDataValueType.STRING
              : CustomDataValueType.NUMBER,
        },
        logger
      );
      return args[1];
  }
};

enum CustomDataListOptions {
  AVERAGE = "AVERAGE",
  MAX = "MAX",
  MIN = "MIN",
  SIZE = "SIZE",
  SUM = "SUM",
}
const customDataListOperationsLogic = async (
  content: undefined | string,
  operation: CustomDataListOptions,
  customCommandsBroadcastsDbPath: string,
  logger: Logger
): Promise<string> => {
  // Check if the content string has two elements, otherwise throw error
  if (content === undefined || content.trim().length === 0) {
    throw Error("Plugin argument was empty");
  }

  const list = await customCommandsBroadcastsDb.requests.customData.getEntry(
    customCommandsBroadcastsDbPath,
    { id: content },
    logger
  );

  switch (operation) {
    case CustomDataListOptions.AVERAGE:
    case CustomDataListOptions.MAX:
    case CustomDataListOptions.MIN:
    case CustomDataListOptions.SUM:
      if (list.valueType !== CustomDataValueType.NUMBER_LIST) {
        throw Error(`Expected a number array but found ${list.valueType}`);
      }
      switch (operation) {
        case CustomDataListOptions.AVERAGE:
          return `${
            list.value.reduce((total, current) => total + current, 0) /
            list.value.length
          }`;
        case CustomDataListOptions.MAX:
          return `${Math.max(...list.value)}`;
        case CustomDataListOptions.MIN:
          return `${Math.min(...list.value)}`;
        case CustomDataListOptions.SUM:
          return `${list.value.reduce((total, current) => total + current, 0)}`;
      }
    // eslint-disable-next-line no-fallthrough
    case CustomDataListOptions.SIZE:
      if (
        list.valueType !== CustomDataValueType.NUMBER_LIST &&
        list.valueType !== CustomDataValueType.STRING_LIST
      ) {
        throw Error(`Expected an array but found ${list.valueType}`);
      }
      return `${list.value.length}`;
  }
};
const customDataListClearLogic = async (
  content: undefined | string,
  clear: "NUMBER" | "STRING",
  customCommandsBroadcastsDbPath: string,
  logger: Logger
): Promise<string> => {
  // Check if the content string has two elements, otherwise throw error
  if (content === undefined || content.trim().length === 0) {
    throw Error("Plugin argument was empty");
  }

  const exists =
    await customCommandsBroadcastsDb.requests.customData.existsEntry(
      customCommandsBroadcastsDbPath,
      { id: content },
      logger
    );
  if (exists) {
    await customCommandsBroadcastsDb.requests.customData.removeEntry(
      customCommandsBroadcastsDbPath,
      { id: content },
      logger
    );
  }

  await customCommandsBroadcastsDb.requests.customData.createEntry(
    customCommandsBroadcastsDbPath,
    {
      id: content,
      value: [],
      valueType:
        clear === "NUMBER"
          ? CustomDataValueType.NUMBER_LIST
          : CustomDataValueType.STRING_LIST,
    },
    logger
  );

  return "";
};
enum CustomListLogicOperator {
  APPEND = "+=",
  APPEND_NUMBER = "+#=",
  GET_INDEX = "=@=",
  REMOVE_INDEX = "-@=",
}
const customDataListLogic = async (
  content: undefined | string,
  customCommandsBroadcastsDbPath: string,
  logger: Logger
): Promise<string> => {
  // Check if the content string has two elements, otherwise throw error
  if (content === undefined || content.trim().length === 0) {
    throw Error("Plugin argument was empty");
  }
  const operators = /.+?(\+=|\+#=|=@=|-@=).+?/;
  const operatorMatch = content.match(operators);

  if (operatorMatch === null) {
    // Get the value
    const exists =
      await customCommandsBroadcastsDb.requests.customData.existsEntry(
        customCommandsBroadcastsDbPath,
        { id: content },
        logger
      );
    if (!exists) {
      throw Error(`Expected an custom data entry but found none '${content}'`);
    }
    const entry = await customCommandsBroadcastsDb.requests.customData.getEntry(
      customCommandsBroadcastsDbPath,
      { id: content },
      logger
    );
    return convertCustomDataValueToDbString(entry.value, entry.valueType);
  }
  const operator = operatorMatch[1] as CustomListLogicOperator;
  const args = content
    .trim()
    .split(operator)
    .map((a) => a.trim());
  if (args.length !== 2) {
    throw Error(
      `Plugin argument format incorrect (it should be 'nameOPERATORvalue' and more/less than 2 elements were found using '${operator}' in '${content.trim()}'/${JSON.stringify(
        args
      )})`
    );
  }

  // Validate if the plugin value is correct
  switch (operator) {
    case CustomListLogicOperator.APPEND:
      break;
    case CustomListLogicOperator.APPEND_NUMBER:
    case CustomListLogicOperator.GET_INDEX:
    case CustomListLogicOperator.REMOVE_INDEX:
      if (isNaN(parseFloat(args[1]))) {
        throw Error(
          `Plugin value incorrect (a number was expected instead of '${content.trim()}')`
        );
      }
      break;
  }

  const exists =
    await customCommandsBroadcastsDb.requests.customData.existsEntry(
      customCommandsBroadcastsDbPath,
      { id: args[0] },
      logger
    );

  // Get entry
  let entry;
  if (exists) {
    entry = await customCommandsBroadcastsDb.requests.customData.getEntry(
      customCommandsBroadcastsDbPath,
      { id: args[0] },
      logger
    );
  }

  switch (operator) {
    case CustomListLogicOperator.REMOVE_INDEX:
      if (entry === undefined) {
        throw Error(
          `Can't remove list element from non existent list ('${content.trim()}')`
        );
      } else if (
        entry.valueType !== CustomDataValueType.NUMBER_LIST &&
        entry.valueType !== CustomDataValueType.STRING_LIST
      ) {
        throw Error(
          `Can't remove list element from non custom data that is not a list ('${content.trim()}'/'${
            entry.value
          }'/${entry.valueType})`
        );
      } else if (entry.value.length === 0) {
        throw Error(
          `Can't remove list element from empty list ('${content.trim()}')`
        );
      } else {
        const removedElements = entry.value.splice(parseInt(args[0]), 1);
        await customCommandsBroadcastsDb.requests.customData.updateEntry(
          customCommandsBroadcastsDbPath,
          { id: args[0], value: entry.value, valueType: entry.valueType },
          logger
        );
        return `${removedElements[0]}`;
      }
    case CustomListLogicOperator.APPEND:
    case CustomListLogicOperator.APPEND_NUMBER:
      if (entry === undefined) {
        await customCommandsBroadcastsDb.requests.customData.createEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value:
              operator === CustomListLogicOperator.APPEND_NUMBER
                ? [parseFloat(args[1])]
                : [args[1]],
            valueType:
              operator === CustomListLogicOperator.APPEND_NUMBER
                ? CustomDataValueType.NUMBER_LIST
                : CustomDataValueType.STRING_LIST,
          },
          logger
        );
        return args[1];
      } else if (entry.valueType === CustomDataValueType.NUMBER_LIST) {
        entry.value.push(parseFloat(args[1]));
        await customCommandsBroadcastsDb.requests.customData.updateEntry(
          customCommandsBroadcastsDbPath,
          { id: args[0], value: entry.value, valueType: entry.valueType },
          logger
        );
        return args[1];
      } else if (entry.valueType === CustomDataValueType.STRING_LIST) {
        entry.value.push(args[1]);
        await customCommandsBroadcastsDb.requests.customData.updateEntry(
          customCommandsBroadcastsDbPath,
          { id: args[0], value: entry.value, valueType: entry.valueType },
          logger
        );
        return args[1];
      } else {
        throw Error(
          `Can't append list element to custom data that is not a list ('${content.trim()}'/'${
            entry.value
          }'/${entry.valueType})`
        );
      }
    case CustomListLogicOperator.GET_INDEX:
      if (entry === undefined) {
        throw Error(
          `Can't get list element from non existent list ('${content.trim()}')`
        );
      } else if (
        entry.valueType !== CustomDataValueType.NUMBER_LIST &&
        entry.valueType !== CustomDataValueType.STRING_LIST
      ) {
        throw Error(
          `Can't get list element from custom data that is not a list ('${content.trim()}'/'${
            entry.value
          }'/${entry.valueType})`
        );
      } else {
        const element = entry.value.at(parseInt(args[1]));
        if (element === undefined) {
          throw Error(
            `Can't get list element from custom data using the provided index ('${content.trim()}'/'${entry.value.join(
              ","
            )}'/${entry.valueType})`
          );
        }
        return `${element}`;
      }
  }
};

export interface PluginsCustomCommandDataData {
  databasePath: string;
}

export const pluginsCustomCommandDataGenerator: MessageParserPluginGenerator<PluginsCustomCommandDataData>[] =
  [
    {
      description:
        "Create or change a global custom data value (add, append, subtract will throw errors if there is an existing list value)",
      generate: (data) => (logger, content) =>
        customDataLogic(content, data.databasePath, logger),
      id: pluginCustomDataId,
      signature: {
        argument: [
          "id=stringToSet",
          "id#=numberToSet",
          "id+=stringToAppend",
          "id+#=numberToAdd",
          "id-#=numberToSubtract",
          "id<>stringToSetIfIdNotFound",
          "id<#>numberToSetIfIdNotFound",
        ],
        type: "signature",
      },
    },
    {
      description:
        "Create or change a global custom list data value (append, remove, will throw errors if there is an existing non list value) - clearing a list will always reset the value to an empty list and getting the list will return all values joined by ', '",
      generate: (data) => (logger, content) =>
        customDataListLogic(content, data.databasePath, logger),
      id: pluginCustomDataListId,
      signature: {
        argument: [
          "id",
          "id+=stringToAppend",
          "id+#=numberToAppend",
          "id=@=numberIndexToGet",
          "id-@=numberIndexToRemove",
        ],
        type: "signature",
      },
    },
    {
      description:
        "Get the size of a list stored in global custom data value (throws if not a list)",
      generate: (data) => (logger, content) =>
        customDataListOperationsLogic(
          content,
          CustomDataListOptions.SIZE,
          data.databasePath,
          logger
        ),
      id: pluginCustomDataListSizeId,
      signature: { argument: "id", type: "signature" },
    },
    {
      description: "Set global custom data value to an empty number list",
      generate: (data) => (logger, content) =>
        customDataListClearLogic(content, "NUMBER", data.databasePath, logger),
      id: pluginCustomDataListClearNumberId,
      signature: { argument: "id", type: "signature" },
    },
    {
      description: "Set global custom data value to an empty string list",
      generate: (data) => (logger, content) =>
        customDataListClearLogic(content, "STRING", data.databasePath, logger),
      id: pluginCustomDataListClearId,
      signature: { argument: "id", type: "signature" },
    },
    {
      description:
        "Get the maximum number stored in global custom data value number list (throws if not a number list)",
      generate: (data) => (logger, content) =>
        customDataListOperationsLogic(
          content,
          CustomDataListOptions.MAX,
          data.databasePath,
          logger
        ),
      id: pluginCustomDataListMaxId,
      signature: { argument: "id", type: "signature" },
    },
    {
      description:
        "Get the minimum number stored in global custom data value number list (throws if not a number list)",
      generate: (data) => (logger, content) =>
        customDataListOperationsLogic(
          content,
          CustomDataListOptions.MIN,
          data.databasePath,
          logger
        ),
      id: pluginCustomDataListMinId,
      signature: { argument: "id", type: "signature" },
    },
    {
      description:
        "Get the average stored in global custom data value number list (throws if not a number list)",
      generate: (data) => (logger, content) =>
        customDataListOperationsLogic(
          content,
          CustomDataListOptions.AVERAGE,
          data.databasePath,
          logger
        ),
      id: pluginCustomDataListAverageId,
      signature: { argument: "id", type: "signature" },
    },
    {
      description:
        "Get the sum stored in global custom data value number list (throws if not a number list)",
      generate: (data) => (logger, content) =>
        customDataListOperationsLogic(
          content,
          CustomDataListOptions.SUM,
          data.databasePath,
          logger
        ),
      id: pluginCustomDataListSumId,
      signature: { argument: "id", type: "signature" },
    },
  ];
