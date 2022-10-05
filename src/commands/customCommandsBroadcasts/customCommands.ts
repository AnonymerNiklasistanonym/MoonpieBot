// Local imports
import {
  convertTwitchBadgeStringToLevel,
  TwitchBadgeLevel,
} from "../../other/twitchBadgeParser";
import {
  customCommandsBroadcastsCommandReplyAddCC,
  customCommandsBroadcastsCommandReplyAddCCAlreadyExists,
} from "../../strings/customCommandsBroadcasts/commandReply";
import {
  CustomCommandsBroadcastsCommands,
  LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
} from "../../info/commands";
import { checkTwitchBadgeLevel } from "../../twitch";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { macroCustomCommandInfo } from "../../messageParser/macros/customCommands";
import { regexCustomCommandAdd } from "../../info/regex";
// Type imports
import type {
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath,
  CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
} from "../customCommandsBroadcasts";
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { RegexCustomCommandAdd } from "../../info/regex";

export interface CommandDeleteDetectorOutput {
  customCommandCooldownInS?: number;
  customCommandId: string;
  customCommandMessage: string;
  customCommandRegex: string;
  customCommandUserLevel?: TwitchBadgeLevel;
}
/**
 * Add command: Add a custom command.
 */
export const commandAddCC: TwitchChatCommandHandler<
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

    const exists =
      await customCommandsBroadcastsDb.requests.customCommand.existsEntry(
        data.customCommandsBroadcastsDbPath,
        {
          id: data.customCommandId,
        },
        logger
      );

    if (!exists) {
      await customCommandsBroadcastsDb.requests.customCommand.createEntry(
        data.customCommandsBroadcastsDbPath,
        {
          cooldownInS: data.customCommandCooldownInS,
          id: data.customCommandId,
          message: data.customCommandMessage,
          regex: data.customCommandRegex,
          userLevel: data.customCommandUserLevel,
        },
        logger
      );
      data.customCommandsBroadcastsRefreshHelper.refreshCustomCommands = true;
    }

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCustomCommandInfo,
        {
          cooldownInS: data.customCommandCooldownInS,
          id: data.customCommandId,
          message: data.customCommandMessage,
          regex: data.customCommandRegex,
          userLevel: data.customCommandUserLevel,
        }
      ),
      messageId: exists
        ? customCommandsBroadcastsCommandReplyAddCCAlreadyExists.id
        : customCommandsBroadcastsCommandReplyAddCC.id,
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
        ...matchGroups,
        customCommandCooldownInS:
          matchGroups.customCommandCooldownInS !== undefined
            ? parseInt(matchGroups.customCommandCooldownInS)
            : undefined,
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
