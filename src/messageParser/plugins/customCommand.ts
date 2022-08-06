// Type imports
import type { MessageParserPlugin } from "../plugins";
import type {
  CustomCommand,
  CustomCommandsJson,
} from "../../customCommandsTimers/customCommand";

export const pluginCustomCommandCountId = "COUNT";

export const getPluginsCustomCommand = (
  customCommand: CustomCommand
): MessageParserPlugin[] => [
  {
    id: pluginCustomCommandCountId,
    description: "Set a global custom command data value",
    func: (_, __, signature) => {
      if (signature === true) {
        return { type: "signature" };
      }
      return `${customCommand.count ? customCommand.count + 1 : 1}`;
    },
  },
];

const customCommandDataLogic = (
  content: undefined | string,
  type: "=#=" | "==" | "<>" | "+=" | "-=",
  customCommands: CustomCommandsJson
): string => {
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
  try {
    const numberValue = parseInt(args[1]);
    if (!Number.isFinite(numberValue)) {
      throw Error("Plugin argument was not finite");
    }
    value = numberValue;
  } catch (err) {
    // Ignore error if the operation doesn't require a number
    if (type === "=#=" || type === "+=" || type === "-=") {
      throw Error(`Plugin argument '${args[1]}' is not a number`);
    }
  }
  if (customCommands.data === undefined) {
    customCommands.data = [];
  }
  const indexGlobalData = customCommands.data.findIndex(
    (a) => a.id === args[0]
  );
  switch (type) {
    case "=#=":
    case "==":
      if (indexGlobalData > -1) {
        // eslint-disable-next-line security/detect-object-injection
        customCommands.data[indexGlobalData].value = value;
      } else {
        customCommands.data.push({
          id: args[0],
          value,
        });
      }
      return args[1];
    case "<>":
      if (indexGlobalData > -1) {
        // eslint-disable-next-line security/detect-object-injection
        return `${customCommands.data[indexGlobalData].value}`;
      }
      customCommands.data.push({
        id: args[0],
        value,
      });
      return `${value}`;
    case "+=":
    case "-=":
      if (indexGlobalData > -1) {
        const existingNumber = Number(
          // eslint-disable-next-line security/detect-object-injection
          customCommands.data[indexGlobalData].value
        );
        if (!Number.isFinite(existingNumber)) {
          throw Error(
            `Global custom command data with id='${args[0]}' (value='${existingNumber}') is not a finite number`
          );
        }
        if (typeof value !== "number" || !Number.isFinite(existingNumber)) {
          throw Error(
            `Global custom command data argument with id='${args[0]}' (value='${value}') is not a finite number`
          );
        }
        if (type === "+=") {
          // eslint-disable-next-line security/detect-object-injection
          customCommands.data[indexGlobalData].value = existingNumber + value;
        } else if (type === "-=") {
          // eslint-disable-next-line security/detect-object-injection
          customCommands.data[indexGlobalData].value = existingNumber - value;
        }
        // eslint-disable-next-line security/detect-object-injection
        return `${customCommands.data[indexGlobalData].value}`;
      }
      if (type === "+=") {
        customCommands.data.push({
          id: args[0],
          value,
        });
        return `${value}`;
      } else if (type === "-=") {
        customCommands.data.push({
          id: args[0],
          value: -value,
        });
        return `${-value}`;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw Error(`Unknown type: '${type}'`);
  }
};

const CUSTOM_COMMAND_DATA_PLUGIN_PREFIX = "CUSTOM_COMMAND_DATA_";

export const pluginCustomCommandDataSetId = `${CUSTOM_COMMAND_DATA_PLUGIN_PREFIX}SET`;
export const pluginCustomCommandDataSetNumberId = `${CUSTOM_COMMAND_DATA_PLUGIN_PREFIX}SET_NUMBER`;
export const pluginCustomCommandDataGetId = `${CUSTOM_COMMAND_DATA_PLUGIN_PREFIX}GET`;
export const pluginCustomCommandDataAddId = `${CUSTOM_COMMAND_DATA_PLUGIN_PREFIX}ADD`;
export const pluginCustomCommandDataRemoveId = `${CUSTOM_COMMAND_DATA_PLUGIN_PREFIX}REMOVE`;

export const getPluginsCustomCommandData = (
  customCommands: CustomCommandsJson
): MessageParserPlugin[] => [
  {
    id: pluginCustomCommandDataSetId,
    description: "Set a global custom command data value",
    func: (_logger, content, signature) => {
      const separator = "==";
      if (signature === true) {
        return {
          type: "signature",
          argument: `id${separator}numberOrString`,
        };
      }
      return customCommandDataLogic(content, separator, customCommands);
    },
  },
  {
    id: pluginCustomCommandDataSetNumberId,
    description:
      "Set a global custom command data value [only numbers allowed]",
    func: (_logger, content, signature) => {
      const separator = "=#=";
      if (signature === true) {
        return {
          type: "signature",
          argument: `id${separator}number`,
        };
      }
      return customCommandDataLogic(content, separator, customCommands);
    },
  },
  {
    id: pluginCustomCommandDataGetId,
    description: "Get a global custom command data value",
    func: (_logger, content, signature) => {
      const separator = "<>";
      if (signature === true) {
        return {
          type: "signature",
          argument: `id${separator}valueIfNotFound`,
        };
      }
      return customCommandDataLogic(content, separator, customCommands);
    },
  },
  {
    id: pluginCustomCommandDataAddId,
    description: "Add a global custom command data value if its a number",
    func: (_, content, signature) => {
      const separator = "+=";
      if (signature === true) {
        return { type: "signature", argument: `id${separator}number` };
      }
      return customCommandDataLogic(content, separator, customCommands);
    },
  },
  {
    id: pluginCustomCommandDataRemoveId,
    description: "Remove a global custom command data value if its a number",
    func: (_, content, signature) => {
      const separator = "-=";
      if (signature === true) {
        return { type: "signature", argument: `id${separator}number` };
      }
      return customCommandDataLogic(content, separator, customCommands);
    },
  },
];
