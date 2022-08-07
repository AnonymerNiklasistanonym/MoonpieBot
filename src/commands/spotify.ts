import {
  errorMessageIdUndefined,
  logTwitchMessageCommandDetected,
  logTwitchMessageCommandReply,
  logTwitchMessageCommandReply2,
} from "../commands";
import { messageParserById } from "../messageParser";
import { spotifyCommandReplySong } from "../strings/spotify/commandReply";
// Type imports
import type { TwitchChatHandler } from "../twitch";

/**
 * The logging ID of this command.
 */
export const LOG_ID_COMMAND_SPOTIFY = "spotify";
/**
 * The logging ID of this module.
 */
export const LOG_ID_MODULE_SPOTIFY = "spotify";

export enum SpotifyCommands {
  SONG = "song",
}

/**
 * Regex to recognize the `!song` command.
 *
 * @example
 * ```text
 * !song $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexSong = /^\s*!song(?:\s*|\s.*)$/i;

export interface Album {
  album_type: string;
  artists: AlbumArtist[];
  name: string;
}
export interface ItemAlbum {
  album: Album;
}
export interface AlbumArtist {
  name: string;
}
export interface ItemArtist {
  artists: Artist[];
}
export interface Artist {
  name: string;
}

export const commandSong: TwitchChatHandler = async (
  client,
  channel,
  tags,
  _,
  __,
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
    commandId: LOG_ID_COMMAND_SPOTIFY,
    subcommandId: SpotifyCommands.SONG,
  };
};

export interface SpotifyChatHandlerData {
  /**
   * Array of all Spotify commands that should be enabled.
   */
  enabled: (SpotifyCommands | string)[];
}

export const spotifyChatHandler: TwitchChatHandler<
  SpotifyChatHandlerData,
  void
> = async (
  client,
  channel,
  tags,
  message,
  data,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
) => {
  // > !song
  if (message.match(regexSong) && data.enabled.includes(SpotifyCommands.SONG)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_SPOTIFY,
      SpotifyCommands.SONG,
      LOG_ID_MODULE_SPOTIFY
    );
    const commandReply = await commandSong(
      client,
      channel,
      tags,
      message,
      undefined,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    logTwitchMessageCommandReply2(logger, commandReply);
  }
};
