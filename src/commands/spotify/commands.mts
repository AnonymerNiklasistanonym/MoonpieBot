// Relative imports
import {
  LOG_ID_CHAT_HANDLER_SPOTIFY,
  SpotifyCommands,
} from "../../info/chatCommands.mjs";
import {
  spotifyCommandsSong,
  spotifyCommandsString,
} from "../../info/strings/spotify/commands.mjs";
import { macroCommandEnabled } from "../../info/macros/commands.mjs";
import { regexSpotifyChatHandlerCommandCommands } from "../../info/regex.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";

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
  createReply: (_channel, _tags, data, logger) => {
    return {
      additionalMacros: new Map([
        [
          macroCommandEnabled.id,
          new Map(
            macroCommandEnabled.generate(
              {
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
              },
              logger,
            ),
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
