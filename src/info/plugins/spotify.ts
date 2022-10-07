// Local imports
import { generateMacroMapFromMacroGenerator } from "../../messageParser/macrosHelper";
import { macroSpotifySong } from "../macros/spotify";
import { spotifyGetCurrentAndRecentSongs } from "../../spotify";
// Type imports
import type { MacroMap } from "../../messageParser/macros";
import type { MessageParserPluginGenerator } from "../../messageParser/plugins";
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
        return generateMacroMapFromMacroGenerator(macroSpotifySong, {
          spotifyData,
        });
      },
    id: "SPOTIFY_SONG",
    signature: {
      exportedMacros: [macroSpotifySong],
      type: "signature",
    },
  };
