// Local imports
import {
  errorMessageEnabledCommandsUndefined,
  errorMessageIdUndefined,
} from "../../commands";
import { LOG_ID_COMMAND_SPOTIFY } from "../spotify";
import { messageParserById } from "../../messageParser";
import { spotifyCommandReplySong } from "../../strings/spotify/commandReply";
import { SpotifyCommands } from "../chat_handler_commands";
// Type imports
import type { TwitchMessageCommandHandler } from "../../twitch";

/**
 * Regex to recognize the `!song` command.
 *
 * @example
 * ```text
 * !song $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexSong = /^\s*!song(?:\s*|\s.*)$/i;

/**
 * Song command:
 * Send a message about the currently played and last played song on Spotify
 * (or only the last played song if currently no song is played).
 */
export const commandSong: TwitchMessageCommandHandler<Record<never, never>> = {
  info: {
    id: SpotifyCommands.SONG,
    groupId: LOG_ID_COMMAND_SPOTIFY,
  },
  detect: (tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (
      message.match(regexSong) &&
      enabledCommands.includes(SpotifyCommands.SONG)
    ) {
      return {
        message: message,
        messageId: tags.id,
        userName: tags.username,
        data: {},
      };
    }
    return false;
  },
  handle: async (
    client,
    channel,
    tags,
    _data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    if (tags.id === undefined) {
      throw errorMessageIdUndefined();
    }

    const msg = await messageParserById(
      spotifyCommandReplySong.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );

    return {
      sentMessage: await client.say(channel, msg),
      replyToMessageId: tags.id,
    };
  },
};
