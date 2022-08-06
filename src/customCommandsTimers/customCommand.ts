// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandDetected,
  logTwitchMessageCommandReply,
} from "../commands";
import { fileExists, readJsonFile } from "../other/fileOperations";
import { TwitchBadgeLevels } from "../other/twitchBadgeParser";
import { createLogFunc } from "../logging";
import { messageParser } from "../messageParser";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { Macros, Plugins } from "../messageParser";
import type { Logger } from "winston";
import type { Strings } from "../strings";

/**
 * The logging ID of this command.
 */
const LOG_ID_COMMAND_CUSTOM_COMMAND = "custom_command";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_CUSTOM_COMMAND = "custom_command";

/**
 * The output name of files connected to this module.
 */
export const outputNameCustomCommands = "customCommands";

// TODO Create plugin that can set and get the custom command values

export enum CustomCommandUserLevel {
  BROADCASTER = "broadcaster",
  MOD = "mod",
  VIP = "vip",
  EVERYONE = "everyone",
}

/**
 * Represents a custom command.
 */
export interface CustomCommand {
  /** ID of the command. */
  id: string;
  /** The channels where the timer should be active. */
  channels: string[];
  /** The message that should be sent. */
  message: string;
  /** The regex string that is used to check for the command. */
  regexString: string;
  /** The allowed user level. */
  userLevel?: CustomCommandUserLevel;
  /** The number of times the command got called. */
  count?: number;
  /** The timestamp of the last time the command was executed. */
  timestampLastExecution?: number;
  /** The number of seconds between a command can not be used after it was used. */
  cooldownInS?: number;
  /** A description for the command. */
  description?: string;
}
/**
 * Represents a custom command data value.
 */
export interface CustomCommandData {
  /** The unique ID. */
  id: string;
  /** The actual value. */
  value: string | number;
  /** A description. */
  description?: string;
}
/**
 * Structured data object that contains all information about custom commands and their data.
 */
export interface CustomCommandsJson {
  /** Pointer to the schema against which this document should be validated (Schema URL/path). */
  $schema?: string;
  /** The custom commands. */
  commands: CustomCommand[];
  /** The custom command data. */
  data?: CustomCommandData[];
}

export const isCustomCommand = (arg: CustomCommand): arg is CustomCommand =>
  typeof arg === "object" &&
  typeof arg.id === "string" &&
  Array.isArray(arg.channels) &&
  arg.channels.every((a) => typeof a === "string") &&
  typeof arg.message === "string" &&
  typeof arg.regexString === "string" &&
  (arg.userLevel
    ? ["broadcaster", "mod", "vip", "everyone"].includes(arg.userLevel)
    : typeof arg.userLevel === "undefined") &&
  (arg.count
    ? typeof arg.count === "number"
    : typeof arg.count === "undefined") &&
  (arg.timestampLastExecution
    ? typeof arg.timestampLastExecution === "number"
    : typeof arg.timestampLastExecution === "undefined") &&
  (arg.cooldownInS
    ? typeof arg.cooldownInS === "number"
    : typeof arg.cooldownInS === "undefined") &&
  (arg.description
    ? typeof arg.description === "string"
    : typeof arg.description === "undefined");

export const isGlobalData = (
  arg: CustomCommandData
): arg is CustomCommandData => {
  if (typeof arg !== "object") {
    console.error("custom command data is not an object");
    return false;
  }
  if (typeof arg.id !== "string") {
    console.error("custom command data.id is not a string");
    return false;
  }
  if (typeof arg.value !== "string" && typeof arg.value !== "number") {
    console.error("custom command data.value is neither a string nor a number");
    return false;
  }
  if (
    typeof arg.description !== "undefined" &&
    typeof arg.description !== "string"
  ) {
    console.error(
      "custom command data.description is not a string or undefined"
    );
    return false;
  }
  return true;
};

export const isCustomCommandsJson = (
  arg: CustomCommandsJson
): arg is CustomCommandsJson =>
  typeof arg === "object" &&
  (arg.$schema
    ? typeof arg.$schema === "string"
    : typeof arg.$schema === "undefined") &&
  Array.isArray(arg.commands) &&
  arg.commands.map(isCustomCommand).every(Boolean) &&
  (arg.data
    ? Array.isArray(arg.data) && arg.data.map(isGlobalData).every(Boolean)
    : typeof arg.data === "undefined");

export const pluginRegexGroupId = "REGEX_GROUP";

export const checkCustomCommand = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  twitchBadgeLevel: TwitchBadgeLevels,
  command: CustomCommand,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<boolean> => {
  if (tags.id === undefined) {
    throw errorMessageIdUndefined();
  }
  if (tags.username === undefined) {
    throw errorMessageUserNameUndefined();
  }

  // Check if the user is allowed to run the command (level)
  if (command.userLevel !== undefined) {
    switch (twitchBadgeLevel) {
      case TwitchBadgeLevels.BROADCASTER:
        break;
      case TwitchBadgeLevels.MODERATOR:
        if (command.userLevel === "broadcaster") {
          return false;
        }
        break;
      case TwitchBadgeLevels.VIP:
        if (
          command.userLevel === "broadcaster" ||
          command.userLevel === "mod"
        ) {
          return false;
        }
        break;
      case TwitchBadgeLevels.NONE:
        if (
          command.userLevel === "broadcaster" ||
          command.userLevel === "mod" ||
          command.userLevel === "vip"
        ) {
          return false;
        }
        break;
    }
  }

  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(command.regexString);
  const match = message.match(regex);
  if (!match) {
    return false;
  }

  logTwitchMessageCommandDetected(
    logger,
    tags.id,
    [tags.username ? `#${tags.username}` : "undefined", message],
    LOG_ID_COMMAND_CUSTOM_COMMAND,
    command.id ? command.id : regex.toString(),
    LOG_ID_MODULE_CUSTOM_COMMAND
  );

  // Check if the user is allowed to run the command (cooldown)
  const currentTimestamp = new Date().getTime();
  if (command.cooldownInS !== undefined) {
    const lastTimestamp = command.timestampLastExecution
      ? command.timestampLastExecution
      : 0;
    if (currentTimestamp - lastTimestamp <= command.cooldownInS * 1000) {
      createLogFunc(logger, LOG_ID_MODULE_CUSTOM_COMMAND).debug(
        `Custom command '${command.id}' won't be executed because of a cooldown of ${command.cooldownInS}s`
      );
      return false;
    }
  }

  const pluginsCommand: Plugins = new Map(globalPlugins);
  pluginsCommand.set(pluginRegexGroupId, (_, regexGroupIndex, signature) => {
    if (signature === true) {
      return {
        type: "signature",
        argument: "regexGroupIndex",
      };
    }
    if (regexGroupIndex === undefined || regexGroupIndex.length === 0) {
      throw Error("Regex group index was undefined or empty");
    }
    return `${match[parseInt(regexGroupIndex)]}`;
  });

  if (command.channels.find((a) => `#${a}` === channel)) {
    const parsedMessage = await messageParser(
      command.message,
      globalStrings,
      pluginsCommand,
      globalMacros,
      logger
    );
    const sentMessage = await client.say(channel, parsedMessage);

    logTwitchMessageCommandReply(
      logger,
      tags.id,
      sentMessage,
      "custom_command",
      command.id ? command.id : regex.toString()
    );
  }

  // Update the last executed timestamp when there is a cooldown
  if (command.cooldownInS) {
    command.timestampLastExecution = currentTimestamp;
  }

  return true;
};

export interface CustomCommandsData {
  customCommands: CustomCommand[];
  customCommandsGlobalData: CustomCommandData[];
}

export const loadCustomCommandsFromFile = async (
  filePath: string,
  logger: Logger
) => {
  const customCommands: CustomCommand[] = [];
  const customCommandsGlobalData: CustomCommandData[] = [];
  const loggerCustomCommands = createLogFunc(logger, "custom_command");

  if (await fileExists(filePath)) {
    loggerCustomCommands.info("Found custom commands file");
    const data = await readJsonFile<CustomCommandsJson>(filePath);
    if (!isCustomCommandsJson(data)) {
      throw Error(
        `Loaded custom commands file '${filePath}' does not match its definition`
      );
    }
    const newCustomCommands = data.commands;
    const newCustomCommandsGlobalData = data.data;
    for (const newCustomCommand of newCustomCommands) {
      loggerCustomCommands.debug(
        `Add custom command '${newCustomCommand.id}': '${newCustomCommand.regexString}' => ${newCustomCommand.message}`
      );
    }
    loggerCustomCommands.info(
      `Added ${newCustomCommands.length} custom command${
        newCustomCommands.length > 1 ? "s" : ""
      }`
    );
    if (newCustomCommandsGlobalData) {
      for (const newGlobalData of newCustomCommandsGlobalData) {
        loggerCustomCommands.debug(
          `Add custom command data '${newGlobalData.id}': '${newGlobalData.value}'`
        );
      }
      loggerCustomCommands.info(
        `Added ${newCustomCommandsGlobalData.length} custom command data`
      );
      customCommandsGlobalData.push(...newCustomCommandsGlobalData);
    }
    customCommands.push(...newCustomCommands);
  }

  return {
    customCommandsGlobalData,
    customCommands,
  };
};
