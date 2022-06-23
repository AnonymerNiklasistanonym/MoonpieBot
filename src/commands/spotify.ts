import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandDetected,
  logTwitchMessageCommandReply,
} from "../commands";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import type SpotifyWebApi from "spotify-web-api-node";
import { spotifyGetCurrentSongAndRecentlyPlayedSongs } from "../spotify";

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
  spotifyWebApi: SpotifyWebApi,
  _strings: Map<string, string>,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  const data = await spotifyGetCurrentSongAndRecentlyPlayedSongs(
    spotifyWebApi,
    logger
  );

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  let messageCurrentlyPlaying = "Currently no song is playing";
  const currData = data?.currentlyPlaying.body.item;
  const recenData = data?.recentlyPlayedTracks.body.items;
  if (currData != null && currData !== undefined) {
    const album = (currData as unknown as ItemAlbum).album;
    const artist = (currData as unknown as ItemArtist).artists;
    messageCurrentlyPlaying = `Currently playing: ${currData.name} by ${artist
      ?.map((a) => a.name)
      .join(", ")}`;
    if (album.album_type !== "single") {
      messageCurrentlyPlaying += ` from ${album.name}`;
    }
    if (currData.external_urls.spotify !== undefined) {
      messageCurrentlyPlaying += ` (${currData.external_urls.spotify})`;
    }
  }
  if (recenData != null && recenData !== undefined) {
    messageCurrentlyPlaying +=
      " previously played " +
      recenData
        .slice(0, 2)
        .map((a) => {
          let b = `${a.track.name} by ${a.track.artists
            ?.map((a) => a.name)
            .join(", ")}`;
          if (a.track.album.album_type !== "single") {
            b += ` from ${a.track.album.name}`;
          }
          return b;
        })
        .join(", ");
  }

  const sentMessage = await client.say(
    channel,
    `@${userName} ${messageCurrentlyPlaying}`
  );

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
  spotifyWebApi: SpotifyWebApi,
  enabled: undefined | string[],
  _strings: Map<string, string>,
  logger: Logger
): Promise<void> => {
  if (enabled === undefined) {
    enabled = [SpotifyCommands.SONG];
  }
  // > !np
  if (message.match(regexSong) && enabled?.includes(SpotifyCommands.SONG)) {
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
      spotifyWebApi,
      _strings,
      logger
    );
    return;
  }
};
