// Package imports
import fetch from "node-fetch";
import http from "http";
import open from "open";
import SpotifyWebApi from "spotify-web-api-node";
// Local imports
import { createLogFunc } from "./logging";
// Type imports
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_SPOTIFY = "spotify";

const REDIRECT_URL = "http://localhost";
const REDIRECT_PORT = 8888;

const OK_STATUS_CODE = 200;
const FORBIDDEN_STATUS_CODE = 403;

/**
 * Get current song and recently played songs on Spotify.
 *
 * @param spotifyClientId The Spotify client ID.
 * @param spotifyClientSecret The Spotify client secret.
 * @param spotifyRefreshToken The refresh token from a previous authentication.
 * @param logger Used for logging.
 * @returns Currently playing and recently played songs data.
 */
export const setupSpotifyAuthentication = async (
  spotifyClientId: string,
  spotifyClientSecret: string,
  spotifyRefreshToken: string | undefined,
  logger: Logger
) => {
  const logSpotify = createLogFunc(logger, LOG_ID_MODULE_SPOTIFY, {
    subsection: "setup_authentication",
  });

  const spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
    redirectUri: `${REDIRECT_URL}:${REDIRECT_PORT}`,
  });

  if (spotifyRefreshToken !== undefined) {
    spotifyApi.setRefreshToken(spotifyRefreshToken);
    // Refresh the access token
    const response = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(response.body.access_token);
    return spotifyApi;
  }

  // If no refresh token is found start authentication process
  const server = http.createServer((req, res) => {
    logSpotify.debug(
      `Spotify API redirect was detected ${JSON.stringify({
        method: req.method,
        host: req.headers.host,
        location: req.headers.location,
        referer: req.headers.referer,
        url: req.url,
      })}`
    );
    if (req.url && req.headers.host) {
      if (req.url.endsWith("/")) {
        res.writeHead(OK_STATUS_CODE);
        res.end(
          `<html><body></body><script>window.location = window.location.href.replace('#', '?');</script></html>`
        );
      } else {
        const url = new URL(req.headers.host + req.url);
        const codeToken = url.searchParams.get("code");
        if (codeToken != null) {
          logSpotify.debug("Spotify API redirect contained code token");
          spotifyApi
            .authorizationCodeGrant(codeToken)
            .then((codeGrantAuthorization) => {
              spotifyApi.setAccessToken(
                codeGrantAuthorization.body["access_token"]
              );
              spotifyApi.setRefreshToken(
                codeGrantAuthorization.body["refresh_token"]
              );
            })
            .then(() => {
              // Tell user that the page can now be closed and clear the private tokens from the URL
              const refreshToken = spotifyApi.getRefreshToken();
              res.writeHead(OK_STATUS_CODE);
              res.end(
                `<html><style>.spoiler{
                  color: black;
                  background-color:black;
                }
                .spoiler:hover{
                  color: white;
                }</style><body><p>Spotify API connection was successful. You can now close this window.</p><br><p>For a permanent authentication you can copy the following refresh token:</p><br><p>Refresh Token: <span class="spoiler">${
                  refreshToken ? refreshToken : "ERROR"
                }</span></p></body><script>window.history.replaceState({}, document.title, "/");</script></html>`
              );
              logSpotify.info("Spotify API connection was successful");
            })
            .catch((err) => {
              res.writeHead(FORBIDDEN_STATUS_CODE);
              res.end(
                `<html><body>Spotify API connection was not successful: ${
                  (err as Error).message
                }</body></html>`
              );
            });
        } else {
          res.writeHead(FORBIDDEN_STATUS_CODE);
          res.end(
            `<html><body>Spotify API connection was not successful: Code was not found!</body></html>`
          );
        }
      }
    } else {
      res.writeHead(FORBIDDEN_STATUS_CODE);
      res.end("Error");
    }
  });
  await new Promise<void>((resolve) => {
    server.listen(REDIRECT_PORT, undefined, () => {
      logSpotify.info("Server started");
      resolve();
    });
  });

  const SPOTIFY_API_URL = "https://accounts.spotify.com";
  let url = SPOTIFY_API_URL + "/authorize";
  url += "?response_type=code";
  url +=
    "&redirect_uri=" + encodeURIComponent(`${REDIRECT_URL}:${REDIRECT_PORT}`);
  url += "&client_id=" + encodeURIComponent(spotifyClientId);
  url +=
    "&scope=" +
    encodeURIComponent("user-read-currently-playing user-read-recently-played");

  // Request authentication if no refresh token is found
  if (spotifyApi.getRefreshToken() === undefined) {
    const response = await fetch(url);
    if (response.ok) {
      await open(response.url);
    }
  }

  return spotifyApi;
};

/**
 * Get current song and recently played songs on Spotify.
 *
 * @param spotifyApi The Spotify api client.
 * @param logger Used for logging.
 * @returns Currently playing and recently played songs data.
 */
export const spotifyGetCurrentAndRecentSongs = async (
  spotifyApi: SpotifyWebApi,
  logger: Logger
) => {
  const logSpotify = createLogFunc(logger, LOG_ID_MODULE_SPOTIFY, {
    subsection: "get_current_and_recent_songs",
  });

  try {
    if (spotifyApi.getRefreshToken() === undefined) {
      logSpotify.error(Error("Spotify refresh token was undefined"));
      return undefined;
    }

    // Refresh the access token
    const response = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(response.body.access_token);

    if (spotifyApi.getAccessToken() === undefined) {
      logSpotify.error(Error("Spotify access token was undefined"));
      return undefined;
    }

    // Get the data from Spotify
    const currentlyPlaying = await spotifyApi.getMyCurrentPlayingTrack();
    const recentlyPlayedTracks = await spotifyApi.getMyRecentlyPlayedTracks();

    logSpotify.debug("Spotify data was successfully acquired");

    return {
      currentlyPlaying,
      recentlyPlayedTracks,
    };
  } catch (err) {
    logSpotify.error(
      Error(`Connection not successful: ${JSON.stringify(err)}`)
    );
    throw err;
  }
};
