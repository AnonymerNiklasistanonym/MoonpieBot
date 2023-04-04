/*
 * Spotify (API) refresh token grant server and uri.
 */

// Package imports
import http from "http";
import SpotifyWebApi from "spotify-web-api-node";
// Relative imports
import { FORBIDDEN_STATUS_CODE, OK_STATUS_CODE } from "../other/web.mjs";
import { createLogFunc } from "../logging.mjs";
import { SpotifyConfig } from "../database/spotifyDb/requests/spotifyConfig.mjs";
import spotifyDb from "../database/spotifyDb.mjs";
// Type imports
import type { DeepReadonly } from "../other/types.mjs";
import type { Logger } from "winston";
import type { Server } from "http";

/** The logging ID of this module. */
const LOG_ID = "spotify_refresh_token_grant";

const SPOTIFY_API_URL = "https://accounts.spotify.com";

export const generateSpotifyApiUrlRefreshTokenGrant = (
  spotifyClientId: string,
  spotifyRedirectUri: string,
): string =>
  SPOTIFY_API_URL +
  "/authorize" +
  "?response_type=code" +
  "&redirect_uri=" +
  encodeURIComponent(spotifyRedirectUri) +
  "&client_id=" +
  encodeURIComponent(spotifyClientId) +
  "&scope=" +
  encodeURIComponent("user-read-currently-playing user-read-recently-played");

const HTML_CODE_FORWARD_CURRENT_MODIFIED_LOCATION =
  "<html><body></body><script>" +
  "alert(window.location.href.replace('#', '?'));" +
  "window.location = window.location.href.replace('#', '?');" +
  "</script></html>";

const generateHtmlCodeRefreshTokenGrantOk = (refreshToken: string) =>
  "<html><style>" +
  ".spoiler{ color: black; background-color:black; }" +
  ".spoiler:hover{ color: white; }" +
  "</style><body><p>" +
  "Spotify API connection was successful. You can now close this window." +
  "</p><br><p>" +
  "If you want to use the refresh token otherwise you can copy it:" +
  // eslint-disable-next-line @typescript-eslint/quotes
  '</p><br><p>Refresh Token: <span class="spoiler">' +
  (refreshToken ? refreshToken : "ERROR") +
  "</span></p></body><script>" +
  // eslint-disable-next-line @typescript-eslint/quotes
  'window.history.replaceState({}, document.title, " / ");' +
  "</script></html>";

const generateHtmlCodeRefreshTokenGrantBad = (error: Readonly<Error>) =>
  "<html><body>" +
  `Spotify API connection was not successful: ${error.message}` +
  "</body></html>";

export const spotifyApiRefreshTokenGrantServer = (
  spotifyApi: DeepReadonly<SpotifyWebApi>,
  spotifyDatabasePath: string,
  logger: Readonly<Logger>,
): Server => {
  const logSpotify = createLogFunc(logger, LOG_ID, "refresh_token_grant");
  const server = http.createServer((req, res) => {
    logSpotify.debug(
      `Spotify API redirect was detected ${JSON.stringify({
        host: req.headers.host,
        location: req.headers.location,
        method: req.method,
        referer: req.headers.referer,
        url: req.url,
      })}`,
    );
    if (req.url && req.headers.host) {
      if (req.url.endsWith("/")) {
        res.writeHead(OK_STATUS_CODE);
        res.end(HTML_CODE_FORWARD_CURRENT_MODIFIED_LOCATION);
      } else {
        const url = new URL(req.headers.host + req.url);
        const codeToken = url.searchParams.get("code");
        if (codeToken != null) {
          logSpotify.debug("Spotify API redirect contained code token");
          spotifyApi
            .authorizationCodeGrant(codeToken)
            .then((codeGrantAuthorization) => {
              spotifyApi.setAccessToken(
                codeGrantAuthorization.body.access_token,
              );
              spotifyApi.setRefreshToken(
                codeGrantAuthorization.body.refresh_token,
              );
              return spotifyDb.requests.spotifyConfig.createOrUpdateEntry(
                spotifyDatabasePath,
                {
                  option: SpotifyConfig.REFRESH_TOKEN,
                  optionValue: codeGrantAuthorization.body.refresh_token,
                },
                logger,
              );
            })
            .then(() => {
              // Tell user that the page can now be closed and clear the private tokens from the URL
              const refreshToken = spotifyApi.getRefreshToken();
              if (refreshToken === undefined) {
                throw Error(
                  "Unexpected undefined refresh token after successful " +
                    "authentication",
                );
              }
              res.writeHead(OK_STATUS_CODE);
              res.end(generateHtmlCodeRefreshTokenGrantOk(refreshToken));
              logSpotify.info("Spotify API connection was successful");
              server.close();
            })
            .catch((err) => {
              res.writeHead(FORBIDDEN_STATUS_CODE);
              res.end(generateHtmlCodeRefreshTokenGrantBad(err as Error));
              server.close();
              throw err;
            });
        } else {
          res.writeHead(FORBIDDEN_STATUS_CODE);
          const error = Error("Code was not found!");
          res.end(generateHtmlCodeRefreshTokenGrantBad(error));
          server.close();
          throw error;
        }
      }
    } else {
      // Unsupported path
      const error = Error(
        "Spotify authentication server encountered request with no url and host",
      );
      logSpotify.error(error);
      res.writeHead(FORBIDDEN_STATUS_CODE);
      res.end(error.message);
    }
  });
  return server;
};
