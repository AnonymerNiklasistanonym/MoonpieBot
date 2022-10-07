// Local imports
import {
  LOG_ID_CHAT_HANDLER_SPOTIFY,
  SpotifyCommands,
} from "../../info/commands";
import {
  spotifyCommandsSong,
  spotifyCommandsString,
} from "../../info/strings/spotify/commands";
import { macroCommandEnabled } from "../../info/macros/commands";
import { regexSpotifyChatHandlerCommandCommands } from "../../info/regex";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler";

export type CommandCommandsCreateReplyInput =
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands;
export type CommandCommandsDetectorInput =
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands;
/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: ChatMessageHandlerReplyCreator<
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput
> = {
  createReply: (_channel, _tags, data) => {
    return {
      additionalMacros: new Map([
        [
          macroCommandEnabled.id,
          new Map(
            macroCommandEnabled.generate({
              convertEnumValueToInfo: (enumValue) => {
                const enabled = data.enabledCommands.includes(enumValue);
                switch (enumValue as SpotifyCommands) {
                  case SpotifyCommands.COMMANDS:
                    break;
                  case SpotifyCommands.SONG:
                    return [spotifyCommandsSong.id, enabled];
                }
                return ["undefined", false];
              },
              enumValues: Object.values(SpotifyCommands),
            })
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
