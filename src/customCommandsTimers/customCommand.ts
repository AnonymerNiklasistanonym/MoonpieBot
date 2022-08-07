// Local imports
import { createLogFunc, typeGuardLog } from "../logging";
import { fileExists, readJsonFile } from "../other/fileOperations";
import {
  parseTwitchBadgeLevel,
  TwitchBadgeLevels,
} from "../other/twitchBadgeParser";
import { errorMessageIdUndefined } from "../commands";
import { messageParser } from "../messageParser";
// Type imports
import type { CustomJson } from "./createExampleFiles";
import type { LogFunc } from "../logging";
import type { Logger } from "winston";
import type { Plugins } from "../messageParser";
import type { TwitchMessageCommandHandler } from "../twitch";

/**
 * The logging ID of this command.
 */
const LOG_ID_COMMAND_CUSTOM_COMMAND = "custom_command";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_CUSTOM_COMMAND = "custom_command";

/**
 * All the possible supported user levels of a single custom command.
 */
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
 * Structured, serializable data object that contains all information about
 * custom commands and their data.
 */
export interface CustomCommandsJson extends CustomJson {
  /** The custom commands. */
  commands: CustomCommand[];
  /** The custom command data. */
  data?: CustomCommandData[];
}

/**
 * Type guard for CustomCommand objects.
 *
 * @param arg Possible CustomCommand object.
 * @param logger Optional logger for more detailed analysis.
 * @returns True if the object can be used as CustomCommand.
 */
export const isCustomCommand = (
  arg: CustomCommand,
  logger?: Logger
): arg is CustomCommand => {
  let logFunc: LogFunc | undefined;
  if (logger) {
    logFunc = createLogFunc(logger, LOG_ID_MODULE_CUSTOM_COMMAND, {
      subsection: "is_custom_command",
    });
  }
  if (typeof arg !== "object") {
    logFunc?.warn(typeGuardLog("object", arg));
    return false;
  }
  if (typeof arg.id !== "string") {
    logFunc?.warn(typeGuardLog("string", arg.id, "id"));
    return false;
  }
  if (!Array.isArray(arg.channels)) {
    logFunc?.warn(typeGuardLog("array", arg.channels, "channels"));
    return false;
  }
  if (
    !arg.channels.every((a, index) => {
      if (typeof a !== "string") {
        logFunc?.warn(typeGuardLog(`string`, a, "channels", index));
        return false;
      }
      return true;
    })
  ) {
    return false;
  }
  if (typeof arg.message !== "string") {
    logFunc?.warn(typeGuardLog("string", arg.message, "message"));
    return false;
  }
  if (typeof arg.regexString !== "string") {
    logFunc?.warn(typeGuardLog("string", arg.regexString, "regexString"));
    return false;
  }
  if (
    typeof arg.userLevel !== "undefined" &&
    !Object.values(CustomCommandUserLevel).includes(arg.userLevel)
  ) {
    logFunc?.warn(
      typeGuardLog(
        "CustomCommandUserLevel/undefined",
        arg.userLevel,
        "userLevel"
      )
    );
    return false;
  }
  if (typeof arg.count !== "undefined" && typeof arg.count !== "number") {
    logFunc?.warn(typeGuardLog("number/undefined", arg.count, "count"));
    return false;
  }
  if (
    typeof arg.timestampLastExecution !== "undefined" &&
    typeof arg.timestampLastExecution !== "number"
  ) {
    logFunc?.warn(
      typeGuardLog(
        "number/undefined",
        arg.timestampLastExecution,
        "timestampLastExecution"
      )
    );
    return false;
  }
  if (
    typeof arg.cooldownInS !== "undefined" &&
    typeof arg.cooldownInS !== "number"
  ) {
    logFunc?.warn(
      typeGuardLog("number/undefined", arg.cooldownInS, "cooldownInS")
    );
    return false;
  }
  if (
    typeof arg.description !== "undefined" &&
    typeof arg.description !== "string"
  ) {
    logFunc?.warn(
      typeGuardLog("string/undefined", arg.description, "description")
    );
    return false;
  }
  return true;
};

/**
 * Type guard for CustomCommandData objects.
 *
 * @param arg Possible CustomCommandData object.
 * @param logger Optional logger for more detailed analysis.
 * @returns True if the object can be used as CustomCommandData.
 */
export const isCustomCommandData = (
  arg: CustomCommandData,
  logger?: Logger
): arg is CustomCommandData => {
  let logFunc: LogFunc | undefined;
  if (logger) {
    logFunc = createLogFunc(logger, LOG_ID_MODULE_CUSTOM_COMMAND, {
      subsection: "is_custom_command_data",
    });
  }
  if (typeof arg !== "object") {
    logFunc?.warn(typeGuardLog("object", arg));
    return false;
  }
  if (typeof arg.id !== "string") {
    logFunc?.warn(typeGuardLog("string", arg.id, "id"));
    return false;
  }
  if (typeof arg.value !== "string" && typeof arg.value !== "number") {
    logFunc?.warn(typeGuardLog("string/number", arg.value, "value"));
    return false;
  }
  if (
    typeof arg.description !== "undefined" &&
    typeof arg.description !== "string"
  ) {
    logFunc?.warn(
      typeGuardLog("string/undefined", arg.description, "description")
    );
    return false;
  }
  return true;
};

/**
 * Type guard for CustomCommandsJson objects.
 *
 * @param arg Possible CustomCommandsJson object.
 * @param logger Optional logger for more detailed analysis.
 * @returns True if the object can be used as CustomCommandsJson.
 */
export const isCustomCommandsJson = (
  arg: CustomCommandsJson,
  logger?: Logger
): arg is CustomCommandsJson => {
  let logFunc: LogFunc | undefined;
  if (logger) {
    logFunc = createLogFunc(logger, LOG_ID_MODULE_CUSTOM_COMMAND, {
      subsection: "is_custom_commands_json",
    });
  }
  if (typeof arg !== "object") {
    logFunc?.warn(typeGuardLog("object", arg));
    return false;
  }
  if (typeof arg.$schema !== "string" && typeof arg.$schema !== "undefined") {
    logFunc?.warn(typeGuardLog("string/undefined", arg.$schema, "$schema"));
    return false;
  }
  if (!Array.isArray(arg.commands)) {
    logFunc?.warn(typeGuardLog("array", arg.commands, "commands"));
    return false;
  }
  if (
    !arg.commands
      .map((a, index) => {
        if (!isCustomCommand(a, logger)) {
          logFunc?.warn(typeGuardLog(`CustomCommand`, a, "commands", index));
          return false;
        }
        return true;
      })
      .every(Boolean)
  ) {
    return false;
  }
  if (typeof arg.data !== "undefined") {
    if (!Array.isArray(arg.data)) {
      logFunc?.warn(typeGuardLog("array", arg.data, "data"));
      return false;
    }
    if (
      !arg.data
        .map((a, index) => {
          if (!isCustomCommandData(a, logger)) {
            logFunc?.warn(typeGuardLog("CustomCommandData", a, "data", index));
            return false;
          }
          return true;
        })
        .every(Boolean)
    ) {
      return false;
    }
  }
  return true;
};

export const pluginRegexGroupId = "REGEX_GROUP";

export interface CommandHandleCustomCommandData {
  /**
   * The regex groups matched by the custom command regex.
   */
  regexGroups: RegExpMatchArray;
}

export const getCustomCommand = (
  customCommand: CustomCommand
): TwitchMessageCommandHandler<CommandHandleCustomCommandData> => {
  return {
    info: {
      groupId: LOG_ID_COMMAND_CUSTOM_COMMAND,
      id: customCommand.id,
    },
    detect: (tags, message) => {
      // Check if the user is allowed to run the command (level)
      if (customCommand.userLevel !== undefined) {
        switch (parseTwitchBadgeLevel(tags)) {
          case TwitchBadgeLevels.BROADCASTER:
            break;
          case TwitchBadgeLevels.MODERATOR:
            if (customCommand.userLevel === "broadcaster") {
              return false;
            }
            break;
          case TwitchBadgeLevels.VIP:
            if (
              customCommand.userLevel === "broadcaster" ||
              customCommand.userLevel === "mod"
            ) {
              return false;
            }
            break;
          case TwitchBadgeLevels.NONE:
            if (
              customCommand.userLevel === "broadcaster" ||
              customCommand.userLevel === "mod" ||
              customCommand.userLevel === "vip"
            ) {
              return false;
            }
            break;
        }
      }
      // Check if the user is allowed to run the command (cooldown)
      const currentTimestamp = new Date().getTime();
      if (customCommand.cooldownInS !== undefined) {
        const lastTimestamp = customCommand.timestampLastExecution
          ? customCommand.timestampLastExecution
          : 0;
        if (
          currentTimestamp - lastTimestamp <=
          customCommand.cooldownInS * 1000
        ) {
          //createLogFunc(logger, LOG_ID_MODULE_CUSTOM_COMMAND).debug(
          //  `Custom command '${customCommand.id}' won't be executed because of a cooldown of ${customCommand.cooldownInS}s`
          //);
          return false;
        }
      }
      // eslint-disable-next-line security/detect-non-literal-regexp
      const regex = new RegExp(customCommand.regexString);
      const match = message.match(regex);
      if (match) {
        return {
          message,
          messageId: tags.id,
          userName: tags.username,
          data: { regexGroups: match },
        };
      }
      return false;
    },
    handle: async (
      client,
      channel,
      tags,
      data,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    ) => {
      if (tags.id === undefined) {
        throw errorMessageIdUndefined();
      }
      const pluginsCommand: Plugins = new Map(globalPlugins);
      pluginsCommand.set(
        pluginRegexGroupId,
        (_, regexGroupIndex, signature) => {
          if (signature === true) {
            return {
              type: "signature",
              argument: "regexGroupIndex",
            };
          }
          if (regexGroupIndex === undefined || regexGroupIndex.length === 0) {
            throw Error("Regex group index was undefined or empty");
          }
          return `${data.regexGroups[parseInt(regexGroupIndex)]}`;
        }
      );

      const parsedMessage = await messageParser(
        customCommand.message,
        globalStrings,
        pluginsCommand,
        globalMacros,
        logger
      );
      const sentMessage = await client.say(channel, parsedMessage);

      return {
        replyToMessageId: tags.id,
        sentMessage,
      };
    },
  };
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
    if (!isCustomCommandsJson(data, logger)) {
      throw Error(
        `Loaded custom commands file '${filePath}' does not match its definition`
      );
    }
    const newCustomCommands = customCommands;
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
