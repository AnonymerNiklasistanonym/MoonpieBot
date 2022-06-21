import SpotifyWebApi from "spotify-web-api-node";
import http from "http";
import fetch from "node-fetch";
import open from "open";
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_SPOTIFY = "spotify";

/**
 * Get current song and recently played songs on Spotify.
 *
 * @param spotifyClientId The Spotify client ID.
 * @param spotifyClientSecret The Spotify client secret.
 * @param logger Used for logging.
 * @returns Currently playing and recently played songs data.
 */
export const setupSpotifyAuthentication = async (
  spotifyClientId: string,
  spotifyClientSecret: string,
  logger: Logger
) => {
  //const redirectCode = "MQCbtKe23z7YzzS44KzZzZgjQa621hgSzHN";
  const redirectPort = 8888;

  const spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
    redirectUri: `http://localhost:${redirectPort}`,
  });

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
      res.writeHead(200);
      if (req.url.endsWith("/")) {
        res.end(
          `<html><body></body><script>window.location = window.location.href.replace('#', '?');</script></html>`
        );
      } else {
        const url = new URL(req.headers.host + req.url);
        console.log(url, url.searchParams);
        const accessToken = url.searchParams.get("access_token");
        if (accessToken != null) {
          logger.info({
            message: "Spotify API redirect contained access token",
            section: LOG_ID_MODULE_SPOTIFY,
          });
          spotifyApi.setAccessToken(accessToken);
        }
        const codeToken = url.searchParams.get("code");
        if (codeToken != null) {
          logger.info({
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
            .catch(console.error);
        }
        res.end(
          `<html><body>Spotify API connection was successful. You can now close this window.</body></html>`
        );
      }
    } else {
      res.writeHead(403);
      res.end("Error");
    }
  });
  await new Promise<void>((resolve) => {
    server.listen(redirectPort, undefined, () => {
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
    "&redirect_uri=" + encodeURIComponent(`http://localhost:${redirectPort}`);
  url += "&client_id=" + encodeURIComponent(spotifyClientId);
  url +=
    "&scope=" +
    encodeURIComponent("user-read-currently-playing user-read-recently-played");

  // Request authentication
  const response = await fetch(url);
  if (response.status === 200) {
    await open(response.url);
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
    if (spotifyApi.getAccessToken() === undefined) {
      logger.info({
        message: "Spotify access token was undefined",
        section: LOG_ID_MODULE_SPOTIFY,
      });
      return undefined;
    }

    // Refresh the access token
    await spotifyApi.refreshAccessToken();
    // Get the data from Spotify
    const currentlyPlaying = await spotifyApi.getMyCurrentPlayingTrack();
    const recentlyPlayedTracks = await spotifyApi.getMyRecentlyPlayedTracks();

    logger.info({
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
