// Local imports
import {
  LOG_ID_CHAT_HANDLER_SPOTIFY,
  SpotifyCommands,
} from "../../info/commands";
import { errorMessageEnabledCommandsUndefined } from "../../commands";
import { messageParserById } from "../../messageParser";
import { spotifyCommandReplySong } from "../../strings/spotify/commandReply";
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
    groupId: LOG_ID_CHAT_HANDLER_SPOTIFY,
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!message.match(regexSong)) {
      return false;
    }
    if (!enabledCommands.includes(SpotifyCommands.SONG)) {
      return false;
    }
    return {
      data: {},
    };
  },
  handle: async (
    client,
    channel,
    _tags,
    _data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    // TODO Do the song fetching in here instead of just calling the command but it's currently not important
    const msg = await messageParserById(
      spotifyCommandReplySong.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );

    return {
      sentMessage: await client.say(channel, msg),
    };
  },
};