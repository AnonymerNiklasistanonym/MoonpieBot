import { macroSpotifySong, macroSpotifySongLogic } from "../macros/spotify";
import { spotifyGetCurrentAndRecentSongs } from "../../spotify";
// Type imports
import type { MacroMap } from "../../messageParser";
import type { MessageParserPluginGenerator } from "../plugins";
import type SpotifyWebApi from "spotify-web-api-node";

export interface PluginSpotifyData {
  spotifyWebApi: SpotifyWebApi;
}

export const pluginSpotifyGenerator: MessageParserPluginGenerator<PluginSpotifyData> =
  {
    generate:
      (data) =>
      async (logger): Promise<MacroMap> => {
        const spotifyData = await spotifyGetCurrentAndRecentSongs(
          data.spotifyWebApi,
          logger
        );
        return new Map([
          [macroSpotifySong.id, new Map(macroSpotifySongLogic(spotifyData))],
        ]);
      },
    id: "SPOTIFY_SONG",
    signature: {
      exportedMacros: [macroSpotifySong],
      type: "signature",
    },
  };
