// Relative imports
import {
  CustomBroadcastValueOptions,
  validateCustomBroadcastValue,
} from "./valueOptions.mjs";
import {
  customCommandsBroadcastsCommandReplyAddCB,
  customCommandsBroadcastsCommandReplyAddCBAlreadyExists,
  customCommandsBroadcastsCommandReplyCBNotFound,
  customCommandsBroadcastsCommandReplyCBsNotFound,
  customCommandsBroadcastsCommandReplyDelCB,
  customCommandsBroadcastsCommandReplyEditCB,
  customCommandsBroadcastsCommandReplyInvalidCronString,
  customCommandsBroadcastsCommandReplyListCB,
  customCommandsBroadcastsCommandReplyListCBsEntry,
  customCommandsBroadcastsCommandReplyListCBsPrefix,
} from "../../info/strings/customCommandsBroadcasts/commandReply.mjs";
import {
  CustomCommandsBroadcastsCommands,
  LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
} from "../../info/chatCommands.mjs";
import {
  generateMacroMapFromMacroGenerator,
  messageParserById,
} from "../../messageParser.mjs";
import {
  regexCustomBroadcastAdd,
  regexCustomBroadcastDelete,
  regexCustomBroadcastEdit,
  RegexCustomBroadcastEdit,
  regexCustomBroadcastList,
} from "../../info/regex.mjs";
import {
  TWITCH_MESSAGE_MAX_CHAR_LENGTH,
  TwitchBadgeLevel,
} from "../../twitch.mjs";
import { checkTwitchBadgeLevel } from "../twitchBadge.mjs";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb.mjs";
import { macroCustomBroadcastInfo } from "../../info/macros/customBroadcast.mjs";
import { macroCustomCommandBroadcastInfoEdit } from "../../info/macros/customCommands.mjs";
import { normalizeMacroMap } from "../../messageParser/macrosHelper.mjs";
import { removeWhitespaceEscapeChatCommandGroup } from "../../other/whiteSpaceChecker.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type {
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath,
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
} from "../customCommandsBroadcasts.mjs";
import type {
  RegexCustomBroadcastAdd,
  RegexCustomBroadcastDelete,
  RegexCustomBroadcastList,
  RegexCustomBroadcastListOffset,
} from "../../info/regex.mjs";

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
      TwitchBadgeLevel.MODERATOR,
      logger,
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
    try {
      validateCustomBroadcastValue(
        CustomBroadcastValueOptions.CRON_STRING,
        customBroadcastInfo.cronString,
      );
    } catch (err) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomBroadcastInfo,
          customBroadcastInfo,
          logger,
        ),
        messageId: customCommandsBroadcastsCommandReplyInvalidCronString.id,
      };
    }

    const exists =
      await customCommandsBroadcastsDb.requests.customBroadcast.existsEntry(
        data.customCommandsBroadcastsDbPath,
        { id: data.customBroadcastId },
        logger,
      );

    if (!exists) {
      await customCommandsBroadcastsDb.requests.customBroadcast.createEntry(
        data.customCommandsBroadcastsDbPath,
        customBroadcastInfo,
        logger,
      );
      data.customCommandsBroadcastsRefreshHelper.refreshCustomBroadcasts = true;
    }

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCustomBroadcastInfo,
        customBroadcastInfo,
        logger,
      ),
      messageId: exists
        ? customCommandsBroadcastsCommandReplyAddCBAlreadyExists.id
        : customCommandsBroadcastsCommandReplyAddCB.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.ADD_CUSTOM_BROADCAST,
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
        customBroadcastCronString: removeWhitespaceEscapeChatCommandGroup(
          matchGroups.cronString,
        ),
        customBroadcastId: removeWhitespaceEscapeChatCommandGroup(
          matchGroups.id,
        ),
        customBroadcastMessage: removeWhitespaceEscapeChatCommandGroup(
          matchGroups.message,
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
      TwitchBadgeLevel.MODERATOR,
      logger,
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
        logger,
      );

    if (exists) {
      await customCommandsBroadcastsDb.requests.customBroadcast.removeEntry(
        data.customCommandsBroadcastsDbPath,
        customBroadcastInfo,
        logger,
      );
      data.customCommandsBroadcastsRefreshHelper.refreshCustomBroadcasts = true;
    }

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCustomBroadcastInfo,
        customBroadcastInfo,
        logger,
      ),
      messageId: exists
        ? customCommandsBroadcastsCommandReplyDelCB.id
        : customCommandsBroadcastsCommandReplyCBNotFound.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.DELETE_CUSTOM_BROADCAST,
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
        customBroadcastId: removeWhitespaceEscapeChatCommandGroup(
          matchGroups.id,
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
  createReply: async (_channel, _tags, data, logger) => {
    if (data.customBroadcastId !== undefined) {
      const exists =
        await customCommandsBroadcastsDb.requests.customBroadcast.existsEntry(
          data.customCommandsBroadcastsDbPath,
          { id: data.customBroadcastId },
          logger,
        );

      if (exists) {
        const customBroadcastInfo =
          await customCommandsBroadcastsDb.requests.customBroadcast.getEntry(
            data.customCommandsBroadcastsDbPath,
            { id: data.customBroadcastId },
            logger,
          );
        return {
          additionalMacros: generateMacroMapFromMacroGenerator(
            macroCustomBroadcastInfo,
            customBroadcastInfo,
            logger,
          ),
          messageId: customCommandsBroadcastsCommandReplyListCB.id,
        };
      }
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomBroadcastInfo,
          { id: data.customBroadcastId },
          logger,
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
        logger,
      );

    if (customBroadcastInfos.length === 0) {
      return { messageId: customCommandsBroadcastsCommandReplyCBsNotFound.id };
    }

    // TODO Think about a better implementation
    return {
      messageId: async (
        globalStrings,
        globalPlugins,
        globalMacros,
        logger2,
      ) => {
        let messageList = await messageParserById(
          customCommandsBroadcastsCommandReplyListCBsPrefix.id,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger2,
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
                customBroadcastInfo,
                logger,
              ),
              logger,
            ),
          );
        }
        messageList += messageListEntries.join(", ");

        // Slice the message if too long
        const message =
          messageList.length > TWITCH_MESSAGE_MAX_CHAR_LENGTH
            ? messageList.slice(
                0,
                TWITCH_MESSAGE_MAX_CHAR_LENGTH - "...".length,
              ) + "..."
            : messageList;
        return message;
      },
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.LIST_CUSTOM_BROADCASTS,
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
    if ("listOffset" in matchGroups && matchGroups.listOffset !== undefined) {
      return {
        data: {
          customBroadcastOffset: parseInt(matchGroups.listOffset),
        },
      };
    }
    if ("id" in matchGroups && matchGroups.id !== undefined) {
      return {
        data: {
          customBroadcastId: removeWhitespaceEscapeChatCommandGroup(
            matchGroups.id,
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

export interface CommandEditDetectorOutput {
  customBroadcastId: string;
  customBroadcastOption: string;
  customBroadcastOptionValue: string;
}
export const commandEditCB: ChatMessageHandlerReplyCreator<
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath &
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandEditDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR,
      logger,
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    const exists =
      await customCommandsBroadcastsDb.requests.customBroadcast.existsEntry(
        data.customCommandsBroadcastsDbPath,
        { id: data.customBroadcastId },
        logger,
      );
    if (!exists) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomBroadcastInfo,
          { id: data.customBroadcastId },
          logger,
        ),
        messageId: customCommandsBroadcastsCommandReplyCBNotFound.id,
      };
    }

    let option: undefined | CustomBroadcastValueOptions;
    for (const value of Object.values(CustomBroadcastValueOptions)) {
      if (value.toLowerCase() === data.customBroadcastOption.toLowerCase()) {
        option = value;
      }
    }

    if (option === undefined) {
      throw Error(
        `Unknown set option '${
          data.customBroadcastOption
        }' (supported: ${Object.values(CustomBroadcastValueOptions).join(
          ",",
        )})`,
      );
    }

    // Validate options
    validateCustomBroadcastValue(option, data.customBroadcastOptionValue);

    await customCommandsBroadcastsDb.requests.customBroadcast.updateEntry(
      data.customCommandsBroadcastsDbPath,
      {
        cronString:
          option === CustomBroadcastValueOptions.CRON_STRING
            ? data.customBroadcastOptionValue
            : undefined,
        description:
          option === CustomBroadcastValueOptions.DESCRIPTION
            ? data.customBroadcastOptionValue
            : undefined,
        id: data.customBroadcastId,
        idNew:
          option === CustomBroadcastValueOptions.ID
            ? data.customBroadcastOptionValue
            : undefined,
        message:
          option === CustomBroadcastValueOptions.MESSAGE
            ? data.customBroadcastOptionValue
            : undefined,
      },
      logger,
    );
    data.customCommandsBroadcastsRefreshHelper.refreshCustomBroadcasts = true;

    return {
      additionalMacros: new Map([
        ...normalizeMacroMap(
          generateMacroMapFromMacroGenerator(
            macroCustomBroadcastInfo,
            {
              id: data.customBroadcastId,
            },
            logger,
          ),
        ),
        ...normalizeMacroMap(
          generateMacroMapFromMacroGenerator(
            macroCustomCommandBroadcastInfoEdit,
            {
              option,
              optionValue: data.customBroadcastOptionValue,
            },
            logger,
          ),
        ),
      ]),
      messageId: customCommandsBroadcastsCommandReplyEditCB.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.EDIT_CUSTOM_BROADCAST,
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomBroadcastEdit);
    if (match) {
      const matchGroups = match.groups as undefined | RegexCustomBroadcastEdit;
      if (!matchGroups) {
        throw Error("RegexCustomBroadcastEdit groups undefined");
      }
      return {
        data: {
          customBroadcastId: removeWhitespaceEscapeChatCommandGroup(
            matchGroups.id,
          ),
          customBroadcastOption: matchGroups.option,
          customBroadcastOptionValue: removeWhitespaceEscapeChatCommandGroup(
            matchGroups.optionValue,
          ),
        },
      };
    }
    return false;
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.EDIT_CUSTOM_BROADCAST,
  },
};
