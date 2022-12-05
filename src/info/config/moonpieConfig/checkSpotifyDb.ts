// Local imports
import { createConsoleLogger, LoggerLevel } from "../../../logging";
import { fileExists } from "../../../other/fileOperations";
import { SpotifyConfig } from "../../../database/spotifyDb/requests/spotifyConfig";
import spotifyDb from "../../../database/spotifyDb";

export const removeSpotifyApiRefreshTokenIfFoundInDb = async (
  spotifyDatabasePath: string,
  spotifyApiRefreshToken: undefined | string
): Promise<undefined | string> => {
  if (spotifyApiRefreshToken === undefined) {
    return undefined;
  }
  if (!(await fileExists(spotifyDatabasePath))) {
    return spotifyApiRefreshToken;
  }
  const consoleLogger = createConsoleLogger(
    "removeSpotifyApiRefreshTokenIfFoundInDb",
    LoggerLevel.ERROR
  );
  await spotifyDb.setup(spotifyDatabasePath, consoleLogger);
  const entries = await spotifyDb.requests.spotifyConfig.getEntries(
    spotifyDatabasePath,
    consoleLogger
  );
  const spotifyApiRefreshTokenDb = entries.find(
    (a) => a.option === SpotifyConfig.REFRESH_TOKEN
  );
  if (
    spotifyApiRefreshTokenDb !== undefined &&
    spotifyApiRefreshTokenDb.optionValue === spotifyApiRefreshToken
  ) {
    return undefined;
  }
  return spotifyApiRefreshToken;
};
