// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandDetected,
  logTwitchMessageCommandReply,
} from "../commands";
import { messageParser } from "../messageParser";
import { TwitchBadgeLevels } from "./twitchBadgeParser";
import { fileExists, readJsonFile } from "./fileOperations";
import { createLogFunc } from "../logging";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import type { Macros, Plugins } from "../messageParser";
import type { Strings } from "../strings";

/**
 * The logging ID of this command.
 */
const LOG_ID_COMMAND_CUSTOM_COMMAND = "custom_command";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_CUSTOM_COMMAND = "custom_command";

// TODO Create plugin that can set and get the custom command values

/**
 * Represents a custom command.
 */
export interface CustomCommand {
  /** Name of the command. */
  name?: string;
  /** The channels where the timer should be active. */
  channels: string[];
  /** The message that should be sent. */
  message: string;
  /** The regex string that is used to check for the command. */
  regexString: string;
  /** The allowed user level. */
  userLevel?: "broadcaster" | "mod" | "vip" | "everyone";
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
 * Represents a custom command global data value.
 */
export interface CustomCommandGlobalData {
  /** The ID. */
  id: string;
  /** The actual value. */
  value: string | number;
  /** A description for the global data value. */
  description?: string;
}
/**
 * Structured data object that contains all information about custom commands and their global data.
 */
export interface CustomCommandsJson {
  /** Pointer to the schema against which this document should be validated (Schema URL/path). */
  $schema?: string;
  /** All custom commands. */
  commands: CustomCommand[];
  /** All global data of the custom commands. */
  globalData?: CustomCommandGlobalData[];
}

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
  // Check if the user is allowed to run the command (cooldown)
  if (command.cooldownInS !== undefined) {
    const currentTimestamp = performance.now();
    const lastTimestamp = command.timestampLastExecution
      ? command.timestampLastExecution
      : 0;
    if (currentTimestamp - lastTimestamp > command.cooldownInS * 1000) {
      command.timestampLastExecution = currentTimestamp;
    } else {
      return false;
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
    command.name ? command.name : regex.toString(),
    LOG_ID_MODULE_CUSTOM_COMMAND
  );

  const pluginsCommand: Plugins = new Map(globalPlugins);
  pluginsCommand.set("REGEX_GROUP", (_logger, regexGroupIndex?: string) => {
    if (regexGroupIndex === undefined || regexGroupIndex.length === 0) {
      throw Error("Regex group index was undefined or empty");
    }
    return `${match[parseInt(regexGroupIndex)]}`;
  });

  if (command.channels.find((a) => a === channel)) {
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
      command.name ? command.name : regex.toString()
    );
  }
  return true;
};

export interface CustomCommandsData {
  customCommands: CustomCommand[];
  customCommandsGlobalData: CustomCommandGlobalData[];
}

export const loadCustomCommandsFromFile = async (
  filePath: string,
  logger: Logger
) => {
  const customCommands: CustomCommand[] = [];
  const customCommandsGlobalData: CustomCommandGlobalData[] = [];
  const loggerCustomCommands = createLogFunc(logger, "custom_command");

  if (await fileExists(filePath)) {
    loggerCustomCommands.info("Found custom commands file");
    const data = await readJsonFile<CustomCommandsJson>(filePath);
    const newCustomCommands = data.commands;
    const newCustomCommandsGlobalData = data.globalData;
    for (const newCustomCommand of newCustomCommands) {
      loggerCustomCommands.debug(
        `Add custom command ${
          newCustomCommand.name ? newCustomCommand.name : "no-name"
        }: ${newCustomCommand.regexString} => ${newCustomCommand.message}`
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
          `Add custom command global data ${newGlobalData.id}: ${newGlobalData.value}`
        );
      }
      loggerCustomCommands.info(
        `Added ${newCustomCommandsGlobalData.length} custom command global data`
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
