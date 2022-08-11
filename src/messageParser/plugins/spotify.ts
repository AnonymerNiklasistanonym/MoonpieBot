import { spotifyGetCurrentAndRecentSongs } from "../../spotify";
// Type imports
import type { MacroDictionaryEntry } from "../../messageParser";
import type { MessageParserPluginGenerator } from "../plugins";
import type SpotifyWebApi from "spotify-web-api-node";

interface Album {
  album_type: string;
  artists: AlbumArtist[];
  name: string;
}
interface ItemAlbum {
  album: Album;
}
interface AlbumArtist {
  name: string;
}
interface ItemArtist {
  artists: Artist[];
}
interface Artist {
  name: string;
}

export enum SpotifySongMacro {
  CURRENT_ALBUM = "CURRENT_ALBUM",
  CURRENT_ARTISTS = "CURRENT_ARTISTS",
  CURRENT_IS_SINGLE = "CURRENT_IS_SINGLE",
  CURRENT_TITLE = "CURRENT_TITLE",
  CURRENT_URL = "CURRENT_URL",
  HAS_CURRENT = "HAS_CURRENT",
  HAS_PREVIOUS = "HAS_PREVIOUS",
  PREVIOUS_ALBUM = "PREVIOUS_ALBUM",
  PREVIOUS_ARTISTS = "PREVIOUS_ARTISTS",
  PREVIOUS_IS_SINGLE = "PREVIOUS_IS_SINGLE",
  PREVIOUS_TITLE = "PREVIOUS_TITLE",
  PREVIOUS_URL = "PREVIOUS_URL",
}

export interface PluginSpotifyData {
  spotifyWebApi: SpotifyWebApi;
}

export const pluginSpotifyGenerator: MessageParserPluginGenerator<PluginSpotifyData> =
  {
    generate: (data) => async (logger) => {
      const spotifyData = await spotifyGetCurrentAndRecentSongs(
        data.spotifyWebApi,
        logger
      );
      const macros: MacroDictionaryEntry[] = [];
      const currData = spotifyData?.currentlyPlaying.body.item;
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
      const recentData = spotifyData?.recentlyPlayedTracks.body.items;
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
    id: "SPOTIFY_SONG",
    signature: {
      exportedMacroKeys: Object.values(SpotifySongMacro),
      exportsMacro: true,
      type: "signature",
    },
  };
