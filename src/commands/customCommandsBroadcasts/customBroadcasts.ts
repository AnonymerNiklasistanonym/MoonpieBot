// Package imports
import cron from "node-cron";
// Local imports
import {
  customCommandsBroadcastsCommandReplyAddCB,
  customCommandsBroadcastsCommandReplyAddCBAlreadyExists,
  customCommandsBroadcastsCommandReplyCBNotFound,
  customCommandsBroadcastsCommandReplyDelCB,
  customCommandsBroadcastsCommandReplyInvalidCronString,
  customCommandsBroadcastsCommandReplyListCB,
  customCommandsBroadcastsCommandReplyListCBsEntry,
  customCommandsBroadcastsCommandReplyListCBsPrefix,
} from "../../info/strings/customCommandsBroadcasts/commandReply";
import {
  CustomCommandsBroadcastsCommands,
  LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
} from "../../info/commands";
import {
  generateMacroMapFromMacroGenerator,
  messageParserById,
} from "../../messageParser";
import { MAX_LENGTH_OF_A_TWITCH_MESSAGE, TwitchBadgeLevel } from "../../twitch";
import {
  regexCustomBroadcastAdd,
  regexCustomBroadcastDelete,
  regexCustomBroadcastList,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../twitchBadge";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
import { macroCustomBroadcastInfo } from "../../info/macros/customBroadcast";
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
  RegexCustomBroadcastAdd,
  RegexCustomBroadcastDelete,
} from "../../info/regex";
import type {
  RegexCustomBroadcastList,
  RegexCustomBroadcastListOffset,
} from "../../info/regex";

export interface CommandAddDetectorOutput {
  customBroadcastCronString: string;
  customBroadcastId: string;
  customBroadcastMessage: string;
}
/**
 * Add a custom command.
 */
export const commandAddCB: ChatMessageHandlerReplyCreator<
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

    const customBroadcastInfo = {
      cronString: data.customBroadcastCronString,
      id: data.customBroadcastId,
      message: data.customBroadcastMessage,
    };

    // TODO Validate message
    if (!cron.validate(customBroadcastInfo.cronString)) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomBroadcastInfo,
          customBroadcastInfo
        ),
        messageId: customCommandsBroadcastsCommandReplyInvalidCronString.id,
      };
    }

    const exists =
      await customCommandsBroadcastsDb.requests.customBroadcast.existsEntry(
        data.customCommandsBroadcastsDbPath,
        { id: data.customBroadcastId },
        logger
      );

    if (!exists) {
      await customCommandsBroadcastsDb.requests.customBroadcast.createEntry(
        data.customCommandsBroadcastsDbPath,
        customBroadcastInfo,
        logger
      );
      data.customCommandsBroadcastsRefreshHelper.refreshCustomBroadcasts = true;
    }

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCustomBroadcastInfo,
        customBroadcastInfo
      ),
      messageId: exists
        ? customCommandsBroadcastsCommandReplyAddCBAlreadyExists.id
        : customCommandsBroadcastsCommandReplyAddCB.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.ADD_CUSTOM_BROADCAST
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomBroadcastAdd);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as undefined | RegexCustomBroadcastAdd;
    if (!matchGroups) {
      throw Error("RegexCustomBroadcastAdd groups undefined");
    }
    return {
      data: {
        customBroadcastCronString: parseRegexStringArgument(
          matchGroups.customBroadcastCronString
        ),
        customBroadcastId: parseRegexStringArgument(
          matchGroups.customBroadcastId
        ),
        customBroadcastMessage: parseRegexStringArgument(
          matchGroups.customBroadcastMessage
        ),
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.ADD_CUSTOM_BROADCAST,
  },
};

export interface CommandDeleteDetectorOutput {
  customBroadcastId: string;
}
/**
 * Delete a custom command.
 */
export const commandDelCB: ChatMessageHandlerReplyCreator<
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

    const customBroadcastInfo = {
      id: data.customBroadcastId,
    };

    const exists =
      await customCommandsBroadcastsDb.requests.customBroadcast.existsEntry(
        data.customCommandsBroadcastsDbPath,
        { id: data.customBroadcastId },
        logger
      );

    if (exists) {
      await customCommandsBroadcastsDb.requests.customBroadcast.removeEntry(
        data.customCommandsBroadcastsDbPath,
        customBroadcastInfo,
        logger
      );
      data.customCommandsBroadcastsRefreshHelper.refreshCustomBroadcasts = true;
    }

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCustomBroadcastInfo,
        customBroadcastInfo
      ),
      messageId: exists
        ? customCommandsBroadcastsCommandReplyDelCB.id
        : customCommandsBroadcastsCommandReplyCBNotFound.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.DELETE_CUSTOM_BROADCAST
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomBroadcastDelete);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as undefined | RegexCustomBroadcastDelete;
    if (!matchGroups) {
      throw Error("RegexCustomBroadcastDelete groups undefined");
    }
    return {
      data: {
        customBroadcastId: parseRegexStringArgument(
          matchGroups.customBroadcastId
        ),
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.DELETE_CUSTOM_BROADCAST,
  },
};

export interface CommandListDetectorOutput {
  customBroadcastId?: string;
  customBroadcastOffset?: number;
}
/**
 * List custom commands.
 */
export const commandListCBs: ChatMessageHandlerReplyCreator<
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

    if (data.customBroadcastId !== undefined) {
      const exists =
        await customCommandsBroadcastsDb.requests.customBroadcast.existsEntry(
          data.customCommandsBroadcastsDbPath,
          { id: data.customBroadcastId },
          logger
        );

      if (exists) {
        const customBroadcastInfo =
          await customCommandsBroadcastsDb.requests.customBroadcast.getEntry(
            data.customCommandsBroadcastsDbPath,
            { id: data.customBroadcastId },
            logger
          );
        return {
          additionalMacros: generateMacroMapFromMacroGenerator(
            macroCustomBroadcastInfo,
            customBroadcastInfo
          ),
          messageId: customCommandsBroadcastsCommandReplyListCB.id,
        };
      }
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomBroadcastInfo,
          { id: data.customBroadcastId }
        ),
        messageId: customCommandsBroadcastsCommandReplyCBNotFound.id,
      };
    }

    const customBroadcastInfos =
      await customCommandsBroadcastsDb.requests.customBroadcast.getEntries(
        data.customCommandsBroadcastsDbPath,
        data.customBroadcastOffset
          ? Math.max(data.customBroadcastOffset - 1, 0)
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
          customCommandsBroadcastsCommandReplyListCBsPrefix.id,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger2
        );
        const messageListEntries = [];
        for (const customBroadcastInfo of customBroadcastInfos) {
          messageListEntries.push(
            await messageParserById(
              customCommandsBroadcastsCommandReplyListCBsEntry.id,
              globalStrings,
              globalPlugins,
              generateMacroMapFromMacroGenerator(
                macroCustomBroadcastInfo,
                customBroadcastInfo
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
        CustomCommandsBroadcastsCommands.LIST_CUSTOM_BROADCASTS
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomBroadcastList);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as
      | undefined
      | RegexCustomBroadcastList
      | RegexCustomBroadcastListOffset;
    if (!matchGroups) {
      throw Error("RegexCustomBroadcastList groups undefined");
    }
    if (
      "customBroadcastOffset" in matchGroups &&
      matchGroups.customBroadcastOffset !== undefined
    ) {
      return {
        data: {
          customBroadcastOffset: parseInt(matchGroups.customBroadcastOffset),
        },
      };
    }
    if (
      "customBroadcastId" in matchGroups &&
      matchGroups.customBroadcastId !== undefined
    ) {
      return {
        data: {
          customBroadcastId: parseRegexStringArgument(
            matchGroups.customBroadcastId
          ),
        },
      };
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.LIST_CUSTOM_BROADCASTS,
  },
};
