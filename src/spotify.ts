/*
 * Spotify API client creation, authentication and queries.
 */

// Package imports
import fetch from "node-fetch";
import http from "http";
import open from "open";
import SpotifyWebApi from "spotify-web-api-node";
// Local imports
import { createLogFunc } from "./logging";
import { SpotifyConfig } from "./database/spotifyDb/requests/spotifyConfig";
import spotifyDb from "./database/spotifyDb";
// Type imports
import type { Logger } from "winston";
import type { Server } from "http";

/**
 * The logging ID of this module.
 */
const LOG_ID = "spotify";

const REDIRECT_URL = "http://localhost";
const REDIRECT_PORT = 9727;

const OK_STATUS_CODE = 200;
const FORBIDDEN_STATUS_CODE = 403;

const SPOTIFY_API_URL = "https://accounts.spotify.com";
const generateSpotifyUrlRefreshTokenGrant = (spotifyClientId: string) =>
  SPOTIFY_API_URL +
  "/authorize" +
  "?response_type=code" +
  "&redirect_uri=" +
  encodeURIComponent(`${REDIRECT_URL}:${REDIRECT_PORT}`) +
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

const generateHtmlCodeRefreshTokenGrantBad = (error: Error) =>
  "<html><body>" +
  `Spotify API connection was not successful: ${error.message}` +
  "</body></html>";

const spotifyRefreshTokenGrantServer = (
  spotifyApi: SpotifyWebApi,
  spotifyDatabasePath: string,
  logger: Logger
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
      })}`
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
                codeGrantAuthorization.body["access_token"]
              );
              spotifyApi.setRefreshToken(
                codeGrantAuthorization.body["refresh_token"]
              );
              return spotifyDb.requests.spotifyConfig.createOrUpdateEntry(
                spotifyDatabasePath,
                {
                  option: SpotifyConfig.REFRESH_TOKEN,
                  optionValue: codeGrantAuthorization.body["refresh_token"],
                },
                logger
              );
            })
            .then(() => {
              // Tell user that the page can now be closed and clear the private tokens from the URL
              const refreshToken = spotifyApi.getRefreshToken();
              if (refreshToken === undefined) {
                throw Error(
                  "Unexpected undefined refresh token after successful " +
                    "authentication"
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
        "Spotify authentication server encountered request with no url and host"
      );
      logSpotify.error(error);
      res.writeHead(FORBIDDEN_STATUS_CODE);
      res.end(error.message);
    }
  });
  return server;
};

interface SpotifyApiErrorBody {
  error?: string;
  error_description?: string;
}

interface SpotifyApiError extends Error {
  body?: SpotifyApiErrorBody;
}

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
  logger: Logger
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
    redirectUri: `${REDIRECT_URL}:${REDIRECT_PORT}`,
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
  const server = spotifyRefreshTokenGrantServer(
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
    generateSpotifyUrlRefreshTokenGrant(spotifyClientId)
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

export interface AlbumObjectSimplified extends ContextObject {
  /**
   * The field is present when getting an artist's albums.
   * Possible values are "album", "single", "compilation", "appears_on".
   * Compare to album_type this field represents relationship between the artist and the album.
   */
  album_group?: "album" | "single" | "compilation" | "appears_on" | undefined;
  /**
   * The type of the album: one of "album", "single", or "compilation".
   */
  album_type: "album" | "single" | "compilation";
  /**
   * The artists of the album.
   * Each artist object includes a link in href to more detailed information about the artist.
   */
  artists: ArtistObjectSimplified[];
  /**
   * The name of the album. In case of an album takedown, the value may be an empty string.
   */
  name: string;
  /**
   * The date the album was first released, for example `1981`.
   * Depending on the precision, it might be shown as `1981-12` or `1981-12-15`.
   */
  release_date: string;
  type: "album";
}

export interface ExternalUrlObject {
  spotify: string;
}

export interface ContextObject {
  /**
   * Known external URLs.
   */
  external_urls: ExternalUrlObject;
  /**
   * The object type.
   */
  type: "artist" | "playlist" | "album" | "show" | "episode";
}

export interface ArtistObjectSimplified extends ContextObject {
  /**
   * The name of the artist.
   */
  name: string;
  type: "artist";
}

export interface TrackObjectSimplified {
  /** The artists who performed the track. */
  artists: ArtistObjectSimplified[];
  /** The track length in milliseconds. */
  duration_ms: number;
  /** Whether or not the track has explicit lyrics (`true` = yes it does; `false` = no it does not OR unknown). */
  explicit: boolean;
  /** Known external URLs for this track. */
  external_urls: ExternalUrlObject;
  /** A link to the Web API endpoint providing full details of the track. */
  href: string;
  /** The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the track. */
  id: string;
  /** The name of the track. */
  name: string;
  /** The object type: "track". */
  type: "track";
  /** The [Spotify URI](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the track. */
  uri: string;
}

export interface TrackObjectFull extends TrackObjectSimplified {
  /**
   * The album on which the track appears.
   */
  album: AlbumObjectSimplified;
}

export interface EpisodeObject extends ContextObject {
  /** A description of the episode. */
  description: string;
  /** The episode length in milliseconds. */
  duration_ms: number;
  /** The name of the episode. */
  name: string;
  /**
   * The date the episode was first released, for example "1981-12-15". Depending on the precision, it might be shown as "1981" or "1981-12".
   */
  release_date: string;
  type: "episode";
}

export interface SpotifyResponseCurrentlyPlayingBody {
  currently_playing_type: "track" | "episode" | "ad" | "unknown";
  is_playing: boolean;
  item: TrackObjectFull | EpisodeObject | null;
  progress_ms: number | null;
  timestamp: number;
}

export interface SpotifyResponseCurrentlyPlaying {
  body: SpotifyResponseCurrentlyPlayingBody;
}

export interface PlayHistoryObject {
  played_at: string;
  track: TrackObjectFull;
}

export interface SpotifyResponseRecentlyPlayedBody {
  items: PlayHistoryObject[];
  next: string | null;
  total?: number | undefined;
}

export interface SpotifyResponseRecentlyPlayed {
  body: SpotifyResponseRecentlyPlayedBody;
}

export interface SpotifyGetCurrentAndRecentSongs {
  currentlyPlaying: SpotifyResponseCurrentlyPlaying;
  recentlyPlayedTracks: SpotifyResponseRecentlyPlayed;
}

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
