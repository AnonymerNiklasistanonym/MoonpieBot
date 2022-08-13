import {
  SpotifyGetCurrentAndRecentSongs,
  spotifyGetCurrentAndRecentSongs,
} from "../../spotify";
// Type imports
import type { MacroDictionaryEntry } from "../../messageParser";
import type { MessageParserPluginGenerator } from "../plugins";
import type SpotifyWebApi from "spotify-web-api-node";

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

export const pluginSpotifySongMacroLogic = (
  spotifyData: SpotifyGetCurrentAndRecentSongs
): MacroDictionaryEntry[] => {
  const currData = spotifyData.currentlyPlaying.body.item;
  const hasCurrent = currData != null;

  const recentData = spotifyData.recentlyPlayedTracks.body.items;
  const hasPrevious = recentData.length > 0;
  const prevData = recentData[0];

  return Object.values(SpotifySongMacro).map<[SpotifySongMacro, string]>(
    (macroId) => {
      let macroValue;
      switch (macroId) {
        case SpotifySongMacro.CURRENT_ALBUM:
          if (
            hasCurrent &&
            currData.type === "track" &&
            currData.album.album_type !== "single"
          ) {
            macroValue = currData.album.name;
          }
          break;
        case SpotifySongMacro.CURRENT_ARTISTS:
          if (hasCurrent && currData.type === "track") {
            macroValue = currData.artists.map((a) => a.name).join(", ");
          }
          break;
        case SpotifySongMacro.CURRENT_IS_SINGLE:
          macroValue =
            hasCurrent &&
            currData.type === "track" &&
            currData.album.album_type === "single";
          break;
        case SpotifySongMacro.CURRENT_TITLE:
          if (hasCurrent && currData.type === "track") {
            macroValue = currData.name;
          }
          break;
        case SpotifySongMacro.CURRENT_URL:
          if (hasCurrent) {
            macroValue = currData.external_urls.spotify;
          }
          break;
        case SpotifySongMacro.HAS_CURRENT:
          macroValue = hasCurrent;
          break;
        case SpotifySongMacro.HAS_PREVIOUS:
          macroValue = hasPrevious;
          break;
        case SpotifySongMacro.PREVIOUS_ALBUM:
          if (hasPrevious) {
            macroValue = prevData.track.album.name;
          }
          break;
        case SpotifySongMacro.PREVIOUS_ARTISTS:
          macroValue = hasPrevious
            ? prevData.track.artists.map((a) => a.name).join(", ")
            : undefined;
          break;
        case SpotifySongMacro.PREVIOUS_IS_SINGLE:
          macroValue =
            hasPrevious && prevData.track.album.album_type === "single";
          break;
        case SpotifySongMacro.PREVIOUS_TITLE:
          macroValue = hasPrevious ? prevData.track.name : undefined;
          break;
        case SpotifySongMacro.PREVIOUS_URL:
          macroValue = hasPrevious
            ? prevData.track.external_urls.spotify
            : undefined;
          break;
      }
      if (typeof macroValue === "boolean") {
        macroValue = macroValue ? "true" : "false";
      }
      if (typeof macroValue === "undefined") {
        macroValue = "undefined";
      }
      return [macroId, macroValue];
    }
  );
};

export const pluginSpotifyGenerator: MessageParserPluginGenerator<PluginSpotifyData> =
  {
    generate:
      (data) =>
      async (logger): Promise<MacroDictionaryEntry[]> => {
        const spotifyData = await spotifyGetCurrentAndRecentSongs(
          data.spotifyWebApi,
          logger
        );
        return pluginSpotifySongMacroLogic(spotifyData);
      },
    id: "SPOTIFY_SONG",
    signature: {
      exportedMacroKeys: Object.values(SpotifySongMacro),
      exportsMacro: true,
      type: "signature",
    },
  };
