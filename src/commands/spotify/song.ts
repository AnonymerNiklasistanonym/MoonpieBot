// Local imports
import {
  LOG_ID_CHAT_HANDLER_SPOTIFY,
  SpotifyCommands,
} from "../../info/commands";
import { messageParserById } from "../../messageParser";
import { regexSpotifyChatHandlerCommandSong } from "../../info/regex";
import { spotifyCommandReplySong } from "../../strings/spotify/commandReply";
// Type imports
import type { EMPTY_OBJECT } from "../../info/other";
import type { TwitchChatCommandHandler } from "../../twitch";

export interface CommandDetectorSpotifySongDataIn {
  enabledCommands: string[];
}

/**
 * Song command:
 * Send a message about the currently played and last played song on Spotify
 * (or only the last played song if currently no song is played).
 */
export const commandSong: TwitchChatCommandHandler<
  EMPTY_OBJECT,
  CommandDetectorSpotifySongDataIn
> = {
  createReply: async (
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
  detect: (_tags, message, data) => {
    if (!message.match(regexSpotifyChatHandlerCommandSong)) {
      return false;
    }
    if (!data.enabledCommands.includes(SpotifyCommands.SONG)) {
      return false;
    }
    return {
      data: {},
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_SPOTIFY,
    id: SpotifyCommands.SONG,
  },
};
