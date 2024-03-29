/*
 * Spotify API client creation, authentication and queries.
 */

// Package imports
import fetch from "node-fetch";
import open from "open";
import SpotifyWebApi from "spotify-web-api-node";
// Local imports
import {
  generateSpotifyApiUrlRefreshTokenGrant,
  spotifyApiRefreshTokenGrantServer,
} from "./spotify/spotifyApiRefreshTokenGrant";
import { createLogFunc } from "./logging";
import { SpotifyConfig } from "./database/spotifyDb/requests/spotifyConfig";
import spotifyDb from "./database/spotifyDb";
// Type imports
import type {
  SpotifyApiError,
  SpotifyApiResponse,
} from "./spotify/spotifyApiTypes";
import type { DeepReadonly } from "./other/types";
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID = "spotify";

const REDIRECT_URL = "http://localhost";
const REDIRECT_PORT = 9727;

export const REDIRECT_URI = `${REDIRECT_URL}:${REDIRECT_PORT}`;

/**
 * Setup Spotify authentication so that API calls can be used and return a
 * working API client.
 *
 * @param spotifyClientId The Spotify API client ID.
 * @param spotifyClientSecret The Spotify API client secret.
 * @param spotifyDatabasePath The path to the Spotify database to save the
 * refresh token if not available already.
 * @param logger Used for logging.
 * @returns The Spotify API client.
 */
export const setupAndGetSpotifyApiClient = async (
  spotifyClientId: string,
  spotifyClientSecret: string,
  spotifyDatabasePath: string,
  logger: Readonly<Logger>
): Promise<SpotifyWebApi> => {
  const logSpotify = createLogFunc(logger, LOG_ID, "authentication");

  const spotifyConfigDbEntries =
    await spotifyDb.requests.spotifyConfig.getEntries(
      spotifyDatabasePath,
      logger
    );
  const spotifyRefreshToken = spotifyConfigDbEntries.find(
    (a) => a.option === SpotifyConfig.REFRESH_TOKEN
  )?.optionValue;

  const spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
    redirectUri: REDIRECT_URI,
    refreshToken: spotifyRefreshToken,
  });

  // Refresh the access token if refresh token was found
  if (spotifyApi.getRefreshToken() !== undefined) {
    try {
      const response = await spotifyApi.refreshAccessToken();
      spotifyApi.setAccessToken(response.body.access_token);
      return spotifyApi;
    } catch (error) {
      logSpotify.error(
        Error(
          "Using the found refresh token gave an error: " +
            (error as Error).message +
            ` (${JSON.stringify((error as SpotifyApiError)?.body)})`
        )
      );
      logSpotify.info("Try to grant refresh token again");
    }
  }

  // Request refresh token if no refresh token is found
  const server = spotifyApiRefreshTokenGrantServer(
    spotifyApi,
    spotifyDatabasePath,
    logger
  );
  // > Start server to catch authentication URL
  await new Promise<void>((resolve) => {
    server.listen(REDIRECT_PORT, undefined, () => {
      logSpotify.info(`Server started on port ${REDIRECT_PORT}`);
      resolve();
    });
  });
  // > Open authentication URL
  const response = await fetch(
    generateSpotifyApiUrlRefreshTokenGrant(spotifyClientId, REDIRECT_URI)
  );
  if (response.ok) {
    logSpotify.info(
      `Grant the Spotify refresh token using the following URL: ${response.url}`
    );
    await open(response.url);
  }

  // > Wait until server is closed
  await new Promise<void>((resolve) => {
    server.on("close", () => {
      logSpotify.info("Server closed");
      resolve();
    });
  });

  // Return Spotify API that is guaranteed to exist and work
  return spotifyApi;
};

export interface SpotifyGetCurrentAndRecentSongs {
  currentlyPlaying: SpotifyApiResponse<SpotifyApi.CurrentlyPlayingResponse>;
  recentlyPlayedTracks: SpotifyApiResponse<SpotifyApi.UsersRecentlyPlayedTracksResponse>;
}

/**
 * Get current song and recently played songs on Spotify.
 *
 * @param spotifyApi The Spotify api client.
 * @param logger Used for logging.
 * @returns Currently playing and recently played songs data.
 */
export const spotifyGetCurrentAndRecentSongs = async (
  spotifyApi: DeepReadonly<SpotifyWebApi>,
  logger: Readonly<Logger>
): Promise<SpotifyGetCurrentAndRecentSongs> => {
  const logSpotify = createLogFunc(
    logger,
    LOG_ID,
    "get_current_and_recent_songs"
  );

  try {
    if (spotifyApi.getRefreshToken() === undefined) {
      throw Error("Spotify refresh token was undefined");
    }

    // Refresh the access token
    const response = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(response.body.access_token);

    if (spotifyApi.getAccessToken() === undefined) {
      throw Error("Spotify access token was undefined");
    }

    // Get the data from Spotify
    const currentlyPlaying = await spotifyApi.getMyCurrentPlayingTrack();
    const recentlyPlayedTracks = await spotifyApi.getMyRecentlyPlayedTracks();

    logSpotify.debug("Spotify data was successfully acquired");

    // Remove the currently playing song from the recently played tracks
    if (
      recentlyPlayedTracks.body?.items?.length > 0 &&
      currentlyPlaying.body?.item?.id !== undefined
    ) {
      recentlyPlayedTracks.body.items = recentlyPlayedTracks.body.items.filter(
        (a) => a.track.id !== currentlyPlaying.body.item?.id
      );
    }

    return { currentlyPlaying, recentlyPlayedTracks };
  } catch (err) {
    logSpotify.error(
      Error(`Connection not successful: ${JSON.stringify(err)}`)
    );
    throw err;
  }
};
