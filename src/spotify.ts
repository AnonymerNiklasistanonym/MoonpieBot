import SpotifyWebApi from "spotify-web-api-node";
import http from "http";
import fetch from "node-fetch";
import open from "open";
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_SPOTIFY = "spotify";

const REDIRECT_URL = "http://localhost";
const REDIRECT_PORT = 8888;

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
    logger.debug({
      message: `Spotify API redirect was detected ${JSON.stringify({
        method: req.method,
        host: req.headers.host,
        location: req.headers.location,
        referer: req.headers.referer,
        url: req.url,
      })}`,
      section: LOG_ID_MODULE_SPOTIFY,
    });
    if (req.url && req.headers.host) {
      if (req.url.endsWith("/")) {
        res.writeHead(200);
        res.end(
          `<html><body></body><script>window.location = window.location.href.replace('#', '?');</script></html>`
        );
      } else {
        const url = new URL(req.headers.host + req.url);
        const codeToken = url.searchParams.get("code");
        if (codeToken != null) {
          logger.debug({
            message: "Spotify API redirect contained code token",
            section: LOG_ID_MODULE_SPOTIFY,
          });
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
              res.writeHead(200);
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
              logger.info({
                message: "Spotify API connection was successful",
                section: LOG_ID_MODULE_SPOTIFY,
              });
            })
            .catch((err) => {
              res.writeHead(403);
              res.end(
                `<html><body>Spotify API connection was not successful: ${
                  (err as Error).message
                }</body></html>`
              );
            });
        } else {
          res.writeHead(403);
          res.end(
            `<html><body>Spotify API connection was not successful: Code was not found!</body></html>`
          );
        }
      }
    } else {
      res.writeHead(403);
      res.end("Error");
    }
  });
  await new Promise<void>((resolve) => {
    server.listen(REDIRECT_PORT, undefined, () => {
      logger.info({
        message: "Server started",
        section: LOG_ID_MODULE_SPOTIFY,
      });
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
    if (response.status === 200) {
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
export const spotifyGetCurrentSongAndRecentlyPlayedSongs = async (
  spotifyApi: SpotifyWebApi,
  logger: Logger
) => {
  try {
    if (spotifyApi.getRefreshToken() === undefined) {
      logger.error({
        message: "Spotify refresh token was undefined",
        section: LOG_ID_MODULE_SPOTIFY,
      });
      return undefined;
    }

    // Refresh the access token
    const response = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(response.body.access_token);

    if (spotifyApi.getAccessToken() === undefined) {
      logger.error({
        message: "Spotify access token was undefined",
        section: LOG_ID_MODULE_SPOTIFY,
      });
      return undefined;
    }

    // Get the data from Spotify
    const currentlyPlaying = await spotifyApi.getMyCurrentPlayingTrack();
    const recentlyPlayedTracks = await spotifyApi.getMyRecentlyPlayedTracks();

    logger.debug({
      message: "Spotify data was successfully acquired",
      section: LOG_ID_MODULE_SPOTIFY,
    });

    return {
      currentlyPlaying,
      recentlyPlayedTracks,
    };
  } catch (err) {
    logger.error({
      message: `Connection not successful: ${JSON.stringify(err)}`,
      section: LOG_ID_MODULE_SPOTIFY,
    });
    throw err;
  }
};
