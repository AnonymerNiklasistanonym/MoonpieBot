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
  customCommandsBroadcastsCommandReplyCCsNotFound,
  customCommandsBroadcastsCommandReplyDelCC,
  customCommandsBroadcastsCommandReplyEditCC,
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
  macroCustomCommandBroadcastInfoEdit,
  macroCustomCommandInfo,
} from "../../info/macros/customCommands";
import {
  regexCustomCommandAdd,
  regexCustomCommandDelete,
  regexCustomCommandEdit,
  RegexCustomCommandEdit,
  RegexCustomCommandList,
  regexCustomCommandList,
  RegexCustomCommandListOffset,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../twitchBadge";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
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

export enum CustomCommandValueOptions {
  COOLDOWN_IN_S = "cooldownInS",
  COUNT = "count",
  DESCRIPTION = "description",
  ID = "id",
  MESSAGE = "message",
  REGEX = "regex",
  USER_LEVEL = "userLevel",
}
const validateCustomCommandValue = (
  option: CustomCommandValueOptions,
  optionValue?: string
): string => {
  switch (option) {
    case CustomCommandValueOptions.COOLDOWN_IN_S:
    case CustomCommandValueOptions.COUNT:
      if (optionValue === undefined) {
        throw Error("Number value was undefined!");
      }
      // eslint-disable-next-line no-case-declarations
      const floatValue = parseFloat(optionValue);
      if (isNaN(floatValue)) {
        throw Error("Number value was NaN!");
      }
      if (!isFinite(floatValue)) {
        throw Error("Number value was not finite!");
      }
      break;
    case CustomCommandValueOptions.DESCRIPTION:
    case CustomCommandValueOptions.ID:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      break;
    case CustomCommandValueOptions.MESSAGE:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      // TODO
      break;
    case CustomCommandValueOptions.REGEX:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      try {
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(optionValue, "i");
      } catch (err) {
        // TODO Add error information
        throw Error(`Regex value was bad (${(err as Error).message})!`);
      }
      break;
    case CustomCommandValueOptions.USER_LEVEL:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      // TODO
      break;
  }
  return optionValue;
};

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

    // Validate options
    // TODO Message validation
    try {
      validateCustomCommandValue(
        CustomCommandValueOptions.REGEX,
        data.customCommandRegex
      );
    } catch (err) {
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
  createReply: async (_channel, _tags, data, logger) => {
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

    if (customCommandInfos.length === 0) {
      return { messageId: customCommandsBroadcastsCommandReplyCCsNotFound.id };
    }

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

export interface CommandEditDetectorOutput {
  customCommandId: string;
  customCommandOption: string;
  customCommandOptionValue: string;
}
export const commandEditCC: ChatMessageHandlerReplyCreator<
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath &
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandEditDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    const exists =
      await customCommandsBroadcastsDb.requests.customCommand.existsEntry(
        data.customCommandsBroadcastsDbPath,
        { id: data.customCommandId },
        logger
      );
    if (!exists) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroCustomCommandInfo,
          { id: data.customCommandId }
        ),
        messageId: customCommandsBroadcastsCommandReplyCCNotFound.id,
      };
    }

    let option: undefined | CustomCommandValueOptions;
    for (const value of Object.values(CustomCommandValueOptions)) {
      if (value.toLowerCase() === data.customCommandOption.toLowerCase()) {
        option = value;
      }
    }

    if (option === undefined) {
      throw Error(
        `Unknown set option '${
          data.customCommandOption
        }' (supported: ${Object.values(CustomCommandValueOptions).join(",")})`
      );
    }

    // Validate options
    validateCustomCommandValue(option, data.customCommandOptionValue);

    await customCommandsBroadcastsDb.requests.customCommand.updateEntry(
      data.customCommandsBroadcastsDbPath,
      {
        cooldownInS:
          option === CustomCommandValueOptions.COOLDOWN_IN_S
            ? parseFloat(data.customCommandOptionValue)
            : undefined,
        countNew:
          option === CustomCommandValueOptions.COUNT
            ? parseInt(data.customCommandOptionValue)
            : undefined,
        description:
          option === CustomCommandValueOptions.DESCRIPTION
            ? data.customCommandOptionValue
            : undefined,
        id: data.customCommandId,
        idNew:
          option === CustomCommandValueOptions.ID
            ? data.customCommandOptionValue
            : undefined,
        message:
          option === CustomCommandValueOptions.MESSAGE
            ? data.customCommandOptionValue
            : undefined,
        regex:
          option === CustomCommandValueOptions.REGEX
            ? data.customCommandOptionValue
            : undefined,
        userLevel:
          option === CustomCommandValueOptions.USER_LEVEL
            ? convertTwitchBadgeStringToLevel(data.customCommandOptionValue)
            : undefined,
      },
      logger
    );
    data.customCommandsBroadcastsRefreshHelper.refreshCustomCommands = true;

    return {
      additionalMacros: new Map([
        ...generateMacroMapFromMacroGenerator(macroCustomCommandInfo, {
          id: data.customCommandId,
        }),
        ...generateMacroMapFromMacroGenerator(
          macroCustomCommandBroadcastInfoEdit,
          {
            option,
            optionValue: data.customCommandOptionValue,
          }
        ),
      ]),
      messageId: customCommandsBroadcastsCommandReplyEditCC.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(
        CustomCommandsBroadcastsCommands.EDIT_CUSTOM_COMMAND
      )
    ) {
      return false;
    }
    const match = message.match(regexCustomCommandEdit);
    if (match) {
      const matchGroups = match.groups as undefined | RegexCustomCommandEdit;
      if (!matchGroups) {
        throw Error("RegexCustomCommandEdit groups undefined");
      }
      return {
        data: {
          customCommandId: parseRegexStringArgument(
            matchGroups.customCommandId
          ),
          customCommandOption: matchGroups.customCommandOption,
          customCommandOptionValue: parseRegexStringArgument(
            matchGroups.customCommandOptionValue
          ),
        },
      };
    }
    return false;
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.EDIT_CUSTOM_COMMAND,
  },
};
