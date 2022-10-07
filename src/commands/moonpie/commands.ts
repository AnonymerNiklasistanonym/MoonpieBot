// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  moonpieCommandsAbout,
  moonpieCommandsAdd,
  moonpieCommandsClaim,
  moonpieCommandsDelete,
  moonpieCommandsGet,
  moonpieCommandsLeaderboard,
  moonpieCommandsRemove,
  moonpieCommandsSet,
  moonpieCommandsString,
} from "../../info/strings/moonpie/commands";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { macroCommandEnabled } from "../../info/macros/commands";
import { regexMoonpieChatHandlerCommandCommands } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";

/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: TwitchChatCommandHandler<
  CommandGenericDetectorInputEnabledCommands,
  CommandGenericDetectorInputEnabledCommands
> = {
  createReply: (_channel, _tags, data) => {
    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCommandEnabled,
        {
          convertEnumValueToInfo: (enumValue) => {
            const enabled = data.enabledCommands.includes(enumValue);
            switch (enumValue as MoonpieCommands) {
              case MoonpieCommands.CLAIM:
                return [moonpieCommandsClaim.id, enabled];
              case MoonpieCommands.COMMANDS:
                break;
              case MoonpieCommands.LEADERBOARD:
                return [moonpieCommandsLeaderboard.id, enabled];
              case MoonpieCommands.GET:
                return [moonpieCommandsGet.id, enabled];
              case MoonpieCommands.SET:
                return [moonpieCommandsSet.id, enabled];
              case MoonpieCommands.ADD:
                return [moonpieCommandsAdd.id, enabled];
              case MoonpieCommands.REMOVE:
                return [moonpieCommandsRemove.id, enabled];
              case MoonpieCommands.DELETE:
                return [moonpieCommandsDelete.id, enabled];
              case MoonpieCommands.ABOUT:
                return [moonpieCommandsAbout.id, enabled];
            }
            return ["undefined", false];
          },
          enumValues: Object.values(MoonpieCommands),
        }
      ),
      messageId: moonpieCommandsString.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(MoonpieCommands.COMMANDS)) {
      return false;
    }
    if (!message.match(regexMoonpieChatHandlerCommandCommands)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.COMMANDS,
  },
};
