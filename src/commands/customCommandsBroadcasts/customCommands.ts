// Local imports
import {
  convertTwitchBadgeStringToLevel,
  MAX_LENGTH_OF_A_TWITCH_MESSAGE,
  TwitchBadgeLevel,
} from "../../twitch";
import {
  customCommandsBroadcastsCommandReplyAddCC,
  customCommandsBroadcastsCommandReplyAddCCAlreadyExists,
  customCommandsBroadcastsCommandReplyCCNotFound,
  customCommandsBroadcastsCommandReplyDelCC,
  customCommandsBroadcastsCommandReplyInvalidRegex,
  customCommandsBroadcastsCommandReplyListCC,
  customCommandsBroadcastsCommandReplyListCCsEntry,
  customCommandsBroadcastsCommandReplyListCCsPrefix,
} from "../../info/strings/customCommandsBroadcasts/commandReply";
import {
  CustomCommandsBroadcastsCommands,
  LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
} from "../../info/commands";
import {
  generateMacroMapFromMacroGenerator,
  messageParserById,
} from "../../messageParser";
import {
  regexCustomCommandAdd,
  regexCustomCommandDelete,
  RegexCustomCommandList,
  regexCustomCommandList,
  RegexCustomCommandListOffset,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../twitchBadge";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
import { macroCustomCommandInfo } from "../../info/macros/customCommands";
import { parseRegexStringArgument } from "../helper";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler";
import type {
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath,
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
} from "../customCommandsBroadcasts";
import type {
  RegexCustomCommandAdd,
  RegexCustomCommandDelete,
} from "../../info/regex";

export interface CommandAddDetectorOutput {
  customCommandCooldownInS?: number;
  customCommandId: string;
  customCommandMessage: string;
  customCommandRegex: string;
  customCommandUserLevel?: TwitchBadgeLevel;
}
/**
 * Add a custom command.
 */
export const commandAddCC: ChatMessageHandlerReplyCreator<
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath &
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandAddDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    const customCommandInfo = {
      cooldownInS: data.customCommandCooldownInS,
      id: data.customCommandId,
      message: data.customCommandMessage,
      regex: data.customCommandRegex,
      userLevel: data.customCommandUserLevel,
    };

    // TODO Validate message

    try {
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(data.customCommandRegex, "i");
    } catch (err) {
      // TODO Add error information
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomCommandInfo,
          customCommandInfo
        ),
        messageId: customCommandsBroadcastsCommandReplyInvalidRegex.id,
      };
    }

    const exists =
      await customCommandsBroadcastsDb.requests.customCommand.existsEntry(
        data.customCommandsBroadcastsDbPath,
        { id: data.customCommandId },
        logger
      );

    if (!exists) {
      await customCommandsBroadcastsDb.requests.customCommand.createEntry(
        data.customCommandsBroadcastsDbPath,
        customCommandInfo,
        logger
      );
      data.customCommandsBroadcastsRefreshHelper.refreshCustomCommands = true;
    }

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCustomCommandInfo,
        customCommandInfo
      ),
      messageId: exists
        ? customCommandsBroadcastsCommandReplyAddCCAlreadyExists.id
        : customCommandsBroadcastsCommandReplyAddCC.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.ADD_CUSTOM_COMMAND
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomCommandAdd);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as undefined | RegexCustomCommandAdd;
    if (!matchGroups) {
      throw Error("RegexCustomCommandAdd groups undefined");
    }
    return {
      data: {
        customCommandCooldownInS:
          matchGroups.customCommandCooldownInS !== undefined
            ? parseInt(matchGroups.customCommandCooldownInS)
            : undefined,
        customCommandId: parseRegexStringArgument(matchGroups.customCommandId),
        customCommandMessage: parseRegexStringArgument(
          matchGroups.customCommandMessage
        ),
        customCommandRegex: parseRegexStringArgument(
          matchGroups.customCommandRegex
        ),
        customCommandUserLevel:
          matchGroups.customCommandUserLevel !== undefined
            ? convertTwitchBadgeStringToLevel(
                matchGroups.customCommandUserLevel
              )
            : undefined,
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.ADD_CUSTOM_COMMAND,
  },
};

export interface CommandDeleteDetectorOutput {
  customCommandId: string;
}
/**
 * Delete a custom command.
 */
export const commandDelCC: ChatMessageHandlerReplyCreator<
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath &
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandDeleteDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    const customCommandInfo = {
      id: data.customCommandId,
    };

    const exists =
      await customCommandsBroadcastsDb.requests.customCommand.existsEntry(
        data.customCommandsBroadcastsDbPath,
        { id: data.customCommandId },
        logger
      );

    if (exists) {
      await customCommandsBroadcastsDb.requests.customCommand.removeEntry(
        data.customCommandsBroadcastsDbPath,
        customCommandInfo,
        logger
      );
      data.customCommandsBroadcastsRefreshHelper.refreshCustomCommands = true;
    }

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCustomCommandInfo,
        customCommandInfo
      ),
      messageId: exists
        ? customCommandsBroadcastsCommandReplyDelCC.id
        : customCommandsBroadcastsCommandReplyCCNotFound.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.DELETE_CUSTOM_COMMAND
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomCommandDelete);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as undefined | RegexCustomCommandDelete;
    if (!matchGroups) {
      throw Error("RegexCustomCommandDelete groups undefined");
    }
    return {
      data: {
        customCommandId: parseRegexStringArgument(matchGroups.customCommandId),
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.DELETE_CUSTOM_COMMAND,
  },
};

export interface CommandListDetectorOutput {
  customCommandId?: string;
  customCommandOffset?: number;
}
/**
 * List custom commands.
 */
export const commandListCCs: ChatMessageHandlerReplyCreator<
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath &
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandListDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    if (data.customCommandId !== undefined) {
      const exists =
        await customCommandsBroadcastsDb.requests.customCommand.existsEntry(
          data.customCommandsBroadcastsDbPath,
          { id: data.customCommandId },
          logger
        );

      if (exists) {
        const customCommandInfo =
          await customCommandsBroadcastsDb.requests.customCommand.getEntry(
            data.customCommandsBroadcastsDbPath,
            { id: data.customCommandId },
            logger
          );
        return {
          additionalMacros: generateMacroMapFromMacroGenerator(
            macroCustomCommandInfo,
            customCommandInfo
          ),
          messageId: customCommandsBroadcastsCommandReplyListCC.id,
        };
      }
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomCommandInfo,
          { id: data.customCommandId }
        ),
        messageId: customCommandsBroadcastsCommandReplyCCNotFound.id,
      };
    }

    const customCommandInfos =
      await customCommandsBroadcastsDb.requests.customCommand.getEntries(
        data.customCommandsBroadcastsDbPath,
        data.customCommandOffset
          ? Math.max(data.customCommandOffset - 1, 0)
          : 0,
        logger
      );

    // TODO Think about a better implementation
    return {
      messageId: async (
        globalStrings,
        globalPlugins,
        globalMacros,
        logger2
      ) => {
        let messageList = await messageParserById(
          customCommandsBroadcastsCommandReplyListCCsPrefix.id,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger2
        );
        const messageListEntries = [];
        for (const customCommandInfo of customCommandInfos) {
          messageListEntries.push(
            await messageParserById(
              customCommandsBroadcastsCommandReplyListCCsEntry.id,
              globalStrings,
              globalPlugins,
              generateMacroMapFromMacroGenerator(
                macroCustomCommandInfo,
                customCommandInfo
              ),
              logger
            )
          );
        }
        messageList += messageListEntries.join(", ");

        // Slice the message if too long
        const message =
          messageList.length > MAX_LENGTH_OF_A_TWITCH_MESSAGE
            ? messageList.slice(
                0,
                MAX_LENGTH_OF_A_TWITCH_MESSAGE - "...".length
              ) + "..."
            : messageList;
        return message;
      },
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.LIST_CUSTOM_COMMANDS
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomCommandList);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as
      | undefined
      | RegexCustomCommandList
      | RegexCustomCommandListOffset;
    if (!matchGroups) {
      throw Error("RegexCustomCommandList groups undefined");
    }
    if (
      "customCommandOffset" in matchGroups &&
      matchGroups.customCommandOffset !== undefined
    ) {
      return {
        data: {
          customCommandOffset: parseInt(matchGroups.customCommandOffset),
        },
      };
    }
    if (
      "customCommandId" in matchGroups &&
      matchGroups.customCommandId !== undefined
    ) {
      return {
        data: {
          customCommandId: parseRegexStringArgument(
            matchGroups.customCommandId
          ),
        },
      };
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.LIST_CUSTOM_COMMANDS,
  },
};