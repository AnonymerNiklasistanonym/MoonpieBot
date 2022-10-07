// Local imports
import {
  convertCustomDataValueValueToString,
  CustomDataValueType,
} from "../../customCommandsBroadcasts/customData";
import {
  pluginCustomCommandDataAddId,
  pluginCustomCommandDataGetId,
  pluginCustomCommandDataRemoveId,
  pluginCustomCommandDataSetId,
  pluginCustomCommandDataSetNumberId,
} from "./customData";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
// Type imports
import type { CustomCommand } from "../../customCommandsBroadcasts/customCommand";
import type { Logger } from "winston";
import type { MessageParserPluginGenerator } from "../../messageParser";

export interface PluginsCustomCommandData {
  customCommand: CustomCommand;
}

export const pluginsCustomCommandGenerator: MessageParserPluginGenerator<PluginsCustomCommandData>[] =
  [
    {
      description: "Set a global custom command data value",
      generate: (data) => () => `${data.customCommand.count}`,
      id: "COUNT",
      signature: { type: "signature" },
    },
  ];

const customCommandDataLogic = async (
  content: undefined | string,
  type: "=#=" | "==" | "<>" | "+=" | "-=",
  customCommandsBroadcastsDbPath: string,
  logger: Logger
): Promise<string> => {
  // Check if the content string has two elements, otherwise throw error
  if (content === undefined || content.trim().length === 0) {
    throw Error("Plugin argument was empty");
  }
  const args = content
    .trim()
    .split(type)
    .map((a) => a.trim());
  if (args.length !== 2) {
    throw Error(
      `Plugin argument format incorrect (it should be 'name${type}value' instead of '${content.trim()}')`
    );
  }
  let value: string | number = args[1];
  let valueType = CustomDataValueType.STRING;
  try {
    const numberValue = parseInt(args[1]);
    if (!Number.isFinite(numberValue)) {
      throw Error("Plugin argument was not finite");
    }
    valueType = CustomDataValueType.NUMBER;
    value = numberValue;
  } catch (err) {
    // Ignore error if the operation doesn't require a number
    if (type === "=#=" || type === "+=" || type === "-=") {
      throw Error(`Plugin argument '${args[1]}' is not a number`);
    }
  }
  const customDataEntryExists =
    await customCommandsBroadcastsDb.requests.customData.existsEntry(
      customCommandsBroadcastsDbPath,
      { id: args[0] },
      logger
    );

  switch (type) {
    case "=#=":
    case "==":
      if (customDataEntryExists) {
        await customCommandsBroadcastsDb.requests.customData.updateEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value,
            valueType,
          },
          logger
        );
      } else {
        await customCommandsBroadcastsDb.requests.customData.createEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value,
            valueType,
          },
          logger
        );
      }
      return args[1];
    case "<>":
      if (customDataEntryExists) {
        const entry =
          await customCommandsBroadcastsDb.requests.customData.getEntry(
            customCommandsBroadcastsDbPath,
            { id: args[0] },
            logger
          );
        return convertCustomDataValueValueToString(
          entry.value,
          entry.valueType
        );
      } else {
        await customCommandsBroadcastsDb.requests.customData.createEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value,
            valueType,
          },
          logger
        );
        return args[1];
      }
    case "+=":
    case "-=":
      if (customDataEntryExists) {
        const entry =
          await customCommandsBroadcastsDb.requests.customData.getEntry(
            customCommandsBroadcastsDbPath,
            { id: args[0] },
            logger
          );
        if (entry.valueType !== CustomDataValueType.NUMBER) {
          throw Error(
            `Custom data ${args[0]} is not a number (${entry.valueType})`
          );
        }
        if (!Number.isFinite(entry.value)) {
          throw Error(
            `Custom data with id='${args[0]}' (value='${entry.value}') is not a finite number`
          );
        }
        if (typeof value !== "number" || !Number.isFinite(entry.value)) {
          throw Error(
            `Custom data argument with id='${args[0]}' (value='${value}') is not a finite number`
          );
        }
        if (type === "+=") {
          await customCommandsBroadcastsDb.requests.customData.updateEntry(
            customCommandsBroadcastsDbPath,
            {
              id: args[0],
              valueIncrease: value,
              valueType: CustomDataValueType.NUMBER,
            },
            logger
          );
          return `${entry.value + value}`;
        } else {
          await customCommandsBroadcastsDb.requests.customData.updateEntry(
            customCommandsBroadcastsDbPath,
            {
              id: args[0],
              valueDecrease: value,
              valueType: CustomDataValueType.NUMBER,
            },
            logger
          );
          return `${entry.value - value}`;
        }
      } else {
        await customCommandsBroadcastsDb.requests.customData.createEntry(
          customCommandsBroadcastsDbPath,
          {
            id: args[0],
            value: type === "+=" ? value : -value,
            valueType,
          },
          logger
        );
        return `${type === "+=" ? value : -value}`;
      }
  }
};

export interface PluginsCustomCommandDataData {
  databasePath: string;
}

export const pluginsCustomCommandDataGenerator: MessageParserPluginGenerator<PluginsCustomCommandDataData>[] =
  [
    {
      description: "Set a global custom command data value",
      generate: (data) => (logger, content) =>
        customCommandDataLogic(content, "==", data.databasePath, logger),
      id: pluginCustomCommandDataSetId,
      signature: {
        argument: "id==numberOrString",
        type: "signature",
      },
    },
    {
      description:
        "Set a global custom command data value [only numbers allowed]",
      generate: (data) => (logger, content) =>
        customCommandDataLogic(content, "=#=", data.databasePath, logger),
      id: pluginCustomCommandDataSetNumberId,
      signature: {
        argument: "id=#=number",
        type: "signature",
      },
    },
    {
      description: "Get a global custom command data value",
      generate: (data) => (logger, content) =>
        customCommandDataLogic(content, "<>", data.databasePath, logger),
      id: pluginCustomCommandDataGetId,
      signature: {
        argument: "id<>valueIfNotFound",
        type: "signature",
      },
    },
    {
      description: "Add a global custom command data value if its a number",
      generate: (data) => (logger, content) =>
        customCommandDataLogic(content, "+=", data.databasePath, logger),
      id: pluginCustomCommandDataAddId,
      signature: { argument: "id+=number", type: "signature" },
    },
    {
      description: "Remove a global custom command data value if its a number",
      generate: (data) => (logger, content) =>
        customCommandDataLogic(content, "-=", data.databasePath, logger),
      id: pluginCustomCommandDataRemoveId,
      signature: { argument: "id-=number", type: "signature" },
    },
  ];
