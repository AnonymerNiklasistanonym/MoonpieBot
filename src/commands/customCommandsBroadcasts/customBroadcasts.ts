// Package imports
import cron from "node-cron";
// Local imports
import {
  customCommandsBroadcastsCommandReplyAddCB,
  customCommandsBroadcastsCommandReplyAddCBAlreadyExists,
  customCommandsBroadcastsCommandReplyCBNotFound,
  customCommandsBroadcastsCommandReplyDelCB,
  customCommandsBroadcastsCommandReplyInvalidCronString,
} from "../../info/strings/customCommandsBroadcasts/commandReply";
import {
  CustomCommandsBroadcastsCommands,
  LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
} from "../../info/commands";
import {
  regexCustomBroadcastAdd,
  regexCustomBroadcastDelete,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../../twitch";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { macroCustomBroadcastInfo } from "../../info/macros/customBroadcast";
import { parseRegexStringArgument } from "../helper";
import { TwitchBadgeLevel } from "../../other/twitchBadgeParser";
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
  RegexCustomBroadcastAdd,
  RegexCustomBroadcastDelete,
} from "../../info/regex";

export interface CommandAddDetectorOutput {
  customBroadcastCronString: string;
  customBroadcastId: string;
  customBroadcastMessage: string;
}
/**
 * Add a custom command.
 */
export const commandAddCB: TwitchChatCommandHandler<
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
export const commandDelCB: TwitchChatCommandHandler<
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
