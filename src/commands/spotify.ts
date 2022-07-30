import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandDetected,
  logTwitchMessageCommandReply,
} from "../commands";
import { messageParserById } from "../messageParser";
import { spotifyCommandReplySong } from "../strings/spotify/commandReply";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../strings";
import type { Macros, Plugins } from "../messageParser";

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

export const commandSong = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  const message = await messageParserById(
    spotifyCommandReplySong.id,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  );

  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_SPOTIFY,
    SpotifyCommands.SONG
  );
};

export const spotifyChatHandler = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  enabled: (SpotifyCommands | string)[] = [],
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  // > !np
  if (message.match(regexSong) && enabled.includes(SpotifyCommands.SONG)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_SPOTIFY,
      SpotifyCommands.SONG,
      LOG_ID_MODULE_SPOTIFY
    );
    await commandSong(
      client,
      channel,
      tags.id,
      tags.username,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    return;
  }
};
