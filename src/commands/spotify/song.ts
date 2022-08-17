// Local imports
import {
  LOG_ID_CHAT_HANDLER_SPOTIFY,
  SpotifyCommands,
} from "../../info/commands";
import { macroSpotifySong } from "../../messageParser/macros/spotify";
import { messageParserById } from "../../messageParser";
import { regexSpotifyChatHandlerCommandSong } from "../../info/regex";
import { spotifyCommandReplySong } from "../../strings/spotify/commandReply";
import { spotifyGetCurrentAndRecentSongs } from "../../spotify";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type SpotifyWebApi from "spotify-web-api-node";

export interface CommandSongCreateReplyInput {
  spotifyWebApi: SpotifyWebApi;
}
export type CommandSongDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
/**
 * Song command:
 * Send a message about the currently played and last played song on Spotify
 * (or only the last played song if currently no song is played).
 */
export const commandSong: TwitchChatCommandHandler<
  CommandSongCreateReplyInput,
  CommandSongDetectorInput
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
    const spotifyData = await spotifyGetCurrentAndRecentSongs(
      data.spotifyWebApi,
      logger
    );

    const macrosWithSpotifySong = new Map(globalMacros);
    macrosWithSpotifySong.set(
      macroSpotifySong.id,
      new Map(macroSpotifySong.generate({ spotifyData }))
    );

    const message = await messageParserById(
      spotifyCommandReplySong.id,
      globalStrings,
      globalPlugins,
      macrosWithSpotifySong,
      logger
    );
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    if (!message.match(regexSpotifyChatHandlerCommandSong)) {
      return false;
    }
    if (!data.enabledCommands.includes(SpotifyCommands.SONG)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_SPOTIFY,
    id: SpotifyCommands.SONG,
  },
};
