// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  moonpieCommandsAbout,
  moonpieCommandsAdd,
  moonpieCommandsClaim,
  moonpieCommandsCommands,
  moonpieCommandsDelete,
  moonpieCommandsGet,
  moonpieCommandsLeaderboard,
  moonpieCommandsRemove,
  moonpieCommandsSet,
  moonpieCommandsString,
} from "../../strings/moonpie/commands";
import { regexMoonpieChatHandlerCommandCommands } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";

export type CommandCommandsCreateReplyInput =
  CommandGenericDetectorInputEnabledCommands;
export type CommandCommandsDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: TwitchChatCommandHandler<
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput
> = {
  createReply: (_channel, _tags, data) => {
    const commandsStringIds: [string, boolean][] = [];
    Object.values(MoonpieCommands).forEach((command) => {
      const enabled = data.enabledCommands.includes(command);
      switch (command) {
        case MoonpieCommands.CLAIM:
          commandsStringIds.push([moonpieCommandsClaim.id, enabled]);
          break;
        case MoonpieCommands.COMMANDS:
          commandsStringIds.push([moonpieCommandsCommands.id, enabled]);
          break;
        case MoonpieCommands.LEADERBOARD:
          commandsStringIds.push([moonpieCommandsLeaderboard.id, enabled]);
          break;
        case MoonpieCommands.GET:
          commandsStringIds.push([moonpieCommandsGet.id, enabled]);
          break;
        case MoonpieCommands.SET:
          commandsStringIds.push([moonpieCommandsSet.id, enabled]);
          break;
        case MoonpieCommands.ADD:
          commandsStringIds.push([moonpieCommandsAdd.id, enabled]);
          break;
        case MoonpieCommands.REMOVE:
          commandsStringIds.push([moonpieCommandsRemove.id, enabled]);
          break;
        case MoonpieCommands.DELETE:
          commandsStringIds.push([moonpieCommandsDelete.id, enabled]);
          break;
        case MoonpieCommands.ABOUT:
          commandsStringIds.push([moonpieCommandsAbout.id, enabled]);
          break;
      }
    });
    return {
      additionalMacros: new Map([
        [
          "COMMAND_ENABLED",
          new Map(
            commandsStringIds.map((a) => [a[0], a[1] ? "true" : "false"])
          ),
        ],
      ]),
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
