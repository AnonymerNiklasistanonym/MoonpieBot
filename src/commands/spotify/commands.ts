// Local imports
import {
  LOG_ID_CHAT_HANDLER_SPOTIFY,
  SpotifyCommands,
} from "../../info/commands";
import {
  spotifyCommandsCommands,
  spotifyCommandsNone,
  spotifyCommandsPrefix,
  spotifyCommandsSong,
} from "../../strings/spotify/commands";
import { genericStringSorter } from "../../other/genericStringSorter";
import { messageParserById } from "../../messageParser";
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
  createReply: async (
    client,
    channel,
    _tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    const commandsStringIds = [];

    Object.values(SpotifyCommands).forEach((command) => {
      if (!data.enabledCommands.includes(command)) {
        return;
      }
      switch (command) {
        case SpotifyCommands.COMMANDS:
          commandsStringIds.push(spotifyCommandsCommands.id);
          break;
        case SpotifyCommands.SONG:
          commandsStringIds.push(spotifyCommandsSong.id);
          break;
      }
    });

    if (commandsStringIds.length === 0) {
      commandsStringIds.push(spotifyCommandsNone.id);
    }

    const commands = [];
    for (const commandsStringId of commandsStringIds) {
      commands.push(
        await messageParserById(
          commandsStringId,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger
        )
      );
    }

    const messagePrefix = await messageParserById(
      spotifyCommandsPrefix.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    const message = `${messagePrefix} ${commands
      .sort(genericStringSorter)
      .join(", ")}`;
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
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
