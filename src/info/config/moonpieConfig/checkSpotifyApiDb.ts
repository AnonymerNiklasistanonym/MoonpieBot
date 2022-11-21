// Local imports
import { createConsoleLogger } from "../../../logging";
import { SpotifyConfig } from "../../../database/spotifyDb/requests/spotifyConfig";
import spotifyDb from "../../../database/spotifyDb";

export const removeSpotifyApiRefreshTokenIfFoundInDb = async (
  spotifyDatabasePath: string,
  spotifyApiRefreshToken: undefined | string
): Promise<undefined | string> => {
  if (spotifyApiRefreshToken === undefined) {
    return undefined;
  }
  const entries = await spotifyDb.requests.spotifyConfig.getEntries(
    spotifyDatabasePath,
    createConsoleLogger("checkSpotifyApiDbRefreshToken", "error")
  );
  const refreshToken = entries.find(
    (a) => a.option === SpotifyConfig.REFRESH_TOKEN
  );
  if (
    refreshToken !== undefined &&
    refreshToken.optionValue === spotifyApiRefreshToken
  ) {
    return undefined;
  }
  return spotifyApiRefreshToken;
};
