import { spotifyGetCurrentAndRecentSongs } from "../../spotify";
// Type imports
import type { ItemAlbum, ItemArtist } from "../../commands/spotify";
import type { MacroDictionaryEntry } from "../../messageParser";
import type { MessageParserPlugin } from "../plugins";
import type SpotifyWebApi from "spotify-web-api-node";

export const pluginSpotifySongId = "SPOTIFY_SONG";
export const enum SpotifySongMacro {
  HAS_CURRENT = "HAS_CURRENT",
  CURRENT_TITLE = "CURRENT_TITLE",
  CURRENT_ARTISTS = "CURRENT_ARTISTS",
  CURRENT_IS_SINGLE = "CURRENT_IS_SINGLE",
  CURRENT_ALBUM = "CURRENT_ALBUM",
  CURRENT_URL = "CURRENT_URL",
  HAS_PREVIOUS = "HAS_PREVIOUS",
  PREVIOUS_TITLE = "PREVIOUS_TITLE",
  PREVIOUS_ARTISTS = "PREVIOUS_ARTISTS",
  PREVIOUS_IS_SINGLE = "PREVIOUS_IS_SINGLE",
  PREVIOUS_ALBUM = "PREVIOUS_ALBUM",
  PREVIOUS_URL = "PREVIOUS_URL",
}

export const pluginSpotifyCurrentPreviousSong = (
  spotifyWebApi: SpotifyWebApi
): MessageParserPlugin => {
  return {
    id: "SPOTIFY_SONG",
    func: async (logger, _, signature) => {
      if (signature === true) {
        return {
          type: "signature",
          exportsMacro: true,
        };
      }
      const data = await spotifyGetCurrentAndRecentSongs(spotifyWebApi, logger);
      const macros: MacroDictionaryEntry[] = [];
      const currData = data?.currentlyPlaying.body.item;
      const hasCurrent = currData != null && currData !== undefined;
      macros.push([
        SpotifySongMacro.HAS_CURRENT,
        hasCurrent ? "true" : "false",
      ]);
      if (hasCurrent) {
        const album = (currData as unknown as ItemAlbum).album;
        const artist = (currData as unknown as ItemArtist).artists;
        macros.push([SpotifySongMacro.CURRENT_TITLE, currData.name]);
        macros.push([
          SpotifySongMacro.CURRENT_ARTISTS,
          artist?.map((a) => a.name).join(", "),
        ]);
        macros.push([
          SpotifySongMacro.CURRENT_IS_SINGLE,
          album.album_type === "single" ? "true" : "false",
        ]);
        if (album.album_type !== "single") {
          macros.push([SpotifySongMacro.CURRENT_ALBUM, album.name]);
        }
        macros.push([
          SpotifySongMacro.CURRENT_URL,
          currData.external_urls.spotify,
        ]);
      }
      const recentData = data?.recentlyPlayedTracks.body.items;
      const hasRecent =
        recentData != null && recentData !== undefined && recentData.length > 0;
      macros.push([
        SpotifySongMacro.HAS_PREVIOUS,
        hasRecent ? "true" : "false",
      ]);
      if (hasRecent) {
        const previousSong = recentData[0];
        macros.push([SpotifySongMacro.PREVIOUS_TITLE, previousSong.track.name]);
        macros.push([
          SpotifySongMacro.PREVIOUS_ARTISTS,
          previousSong.track.artists?.map((a) => a.name).join(", "),
        ]);
        macros.push([
          SpotifySongMacro.PREVIOUS_IS_SINGLE,
          previousSong.track.album.album_type === "single" ? "true" : "false",
        ]);
        if (previousSong.track.album.album_type !== "single") {
          macros.push([
            SpotifySongMacro.PREVIOUS_ALBUM,
            previousSong.track.album.name,
          ]);
        }
        macros.push([
          SpotifySongMacro.PREVIOUS_URL,
          previousSong.track.external_urls.spotify,
        ]);
      }
      return macros;
    },
  };
};
