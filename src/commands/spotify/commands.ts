// Local imports
import {
  LOG_ID_CHAT_HANDLER_SPOTIFY,
  SpotifyCommands,
} from "../../info/commands";
import {
  spotifyCommandsCommands,
  spotifyCommandsSong,
  spotifyCommandsString,
} from "../../strings/spotify/commands";
import { regexSpotifyChatHandlerCommandCommands } from "../../info/regex";
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

    Object.values(SpotifyCommands).forEach((command) => {
      const enabled = data.enabledCommands.includes(command);
      switch (command) {
        case SpotifyCommands.COMMANDS:
          commandsStringIds.push([spotifyCommandsCommands.id, enabled]);
          break;
        case SpotifyCommands.SONG:
          commandsStringIds.push([spotifyCommandsSong.id, enabled]);
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
      messageId: spotifyCommandsString.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(SpotifyCommands.COMMANDS)) {
      return false;
    }
    if (!message.match(regexSpotifyChatHandlerCommandCommands)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_SPOTIFY,
    id: SpotifyCommands.COMMANDS,
  },
};
