// Relative imports
import { parseTwitchBadgeLevel, TwitchBadgeLevel } from "../twitch.mjs";
import customCommandsBroadcastsDb from "../database/customCommandsBroadcastsDb.mjs";
import { messageParser } from "../messageParser.mjs";
import { pluginsRegexGroupGenerator } from "../info/plugins/regexGroup.mjs";
// Type imports
import type { ChatMessageHandlerReplyCreator } from "../chatMessageHandler.mjs";
import type { EMPTY_OBJECT } from "../other/types.mjs";
import type { PluginMap } from "../messageParser.mjs";

/** The logging ID of this module. */
const LOG_ID = "custom_command";

/**
 * Represents a custom command.
 */
export interface CustomCommand {
  /** The number of seconds between a command can not be used after it was used. */
  cooldownInS?: number;
  /** The number of times the command got called. */
  count: number;
  /** A description for the command. */
  description?: string;
  /** ID of the command. */
  id: string;
  /** The message that should be sent. */
  message: string;
  /** The regex string that is used to check for the command. */
  regex: string;
  /** The timestamp of the last time the command was executed. */
  timestampLastExecution?: number;
  /** The allowed user level. */
  userLevel: TwitchBadgeLevel;
}

export interface CommandHandleCustomCommandDetectorDataOut {
  /**
   * The regex groups matched by the custom command regex.
   */
  regexGroups: RegExpMatchArray;
}

export const customCommandChatHandler = (
  customCommandIdRegex: Omit<CustomCommand, "message" | "description">,
  pathDatabase: string,
): ChatMessageHandlerReplyCreator<
  EMPTY_OBJECT,
  EMPTY_OBJECT,
  CommandHandleCustomCommandDetectorDataOut
> => {
  return {
    createReply: (_channel, _tags, data) => {
      const pluginsCommand: PluginMap = new Map();
      pluginsCommand.set(
        pluginsRegexGroupGenerator.id,
        pluginsRegexGroupGenerator.generate(data),
      );

      return {
        messageId: async (
          globalStrings,
          globalPlugins,
          globalMacros,
          loggerMessage,
        ) => {
          const customCommand =
            await customCommandsBroadcastsDb.requests.customCommand.getEntry(
              pathDatabase,
              {
                id: customCommandIdRegex.id,
              },
              loggerMessage,
            );
          const message = await messageParser(
            customCommand.message,
            globalStrings,
            new Map([...globalPlugins, ...pluginsCommand]),
            globalMacros,
            loggerMessage,
          );
          customCommandIdRegex = customCommand;
          return message;
        },
      };
    },
    detect: (tags, message) => {
      // Check if the user is allowed to run the command (level)
      if (
        customCommandIdRegex.userLevel !== undefined &&
        customCommandIdRegex.userLevel > parseTwitchBadgeLevel(tags)
      ) {
        return false;
      }
      // Check if the user is allowed to run the command (cooldown)
      const currentTimestamp = new Date().getTime();
      if (customCommandIdRegex.cooldownInS !== undefined) {
        const lastTimestamp = customCommandIdRegex.timestampLastExecution
          ? customCommandIdRegex.timestampLastExecution
          : 0;
        if (
          currentTimestamp - lastTimestamp <=
          customCommandIdRegex.cooldownInS * 1000
        ) {
          return false;
        }
      }
      // eslint-disable-next-line security/detect-non-literal-regexp
      const match = message.match(new RegExp(customCommandIdRegex.regex, "i"));
      if (!match) {
        return false;
      }

      return { data: { regexGroups: match } };
    },
    info: {
      chatHandlerId: LOG_ID,
      id: customCommandIdRegex.id,
    },
  };
};
