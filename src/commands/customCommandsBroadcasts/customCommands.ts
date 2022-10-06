// Local imports
import {
  convertTwitchBadgeStringToLevel,
  TwitchBadgeLevel,
} from "../../other/twitchBadgeParser";
import {
  customCommandsBroadcastsCommandReplyAddCC,
  customCommandsBroadcastsCommandReplyAddCCAlreadyExists,
  customCommandsBroadcastsCommandReplyCCNotFound,
  customCommandsBroadcastsCommandReplyDelCC,
  customCommandsBroadcastsCommandReplyInvalidRegex,
} from "../../strings/customCommandsBroadcasts/commandReply";
import {
  CustomCommandsBroadcastsCommands,
  LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
} from "../../info/commands";
import {
  regexCustomCommandAdd,
  regexCustomCommandDelete,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../../twitch";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { macroCustomCommandInfo } from "../../messageParser/macros/customCommands";
import { parseRegexStringArgument } from "../helper";
// Type imports
import type {
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath,
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
} from "../customCommandsBroadcasts";
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
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
export const commandAddCC: TwitchChatCommandHandler<
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath &
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
  CommandGenericDetectorInputEnabledCommands,
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
export const commandDelCC: TwitchChatCommandHandler<
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath &
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
  CommandGenericDetectorInputEnabledCommands,
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
