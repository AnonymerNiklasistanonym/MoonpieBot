// Relative imports
import { generateMacroMapFromMacroGenerator } from "../../messageParser.mjs";
import { macroSpotifySong } from "../macros/spotify.mjs";
import { spotifyGetCurrentAndRecentSongs } from "../../spotify.mjs";
// Type imports
import type { MacroMap } from "../../messageParser.mjs";
import type { MessageParserPluginGenerator } from "../../messageParser.mjs";
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
          logger,
        );
        return generateMacroMapFromMacroGenerator(
          macroSpotifySong,
          { spotifyData },
          logger,
        );
      },
    id: "SPOTIFY_SONG",
    signature: {
      exportedMacros: [macroSpotifySong],
      type: "signature",
    },
  };
