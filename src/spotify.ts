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
const LOG_ID = "spotify";

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
): Promise<SpotifyWebApi> => {
  const logSpotify = createLogFunc(logger, LOG_ID, "authentication");

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
        res.end(
          "<html><body></body><script>window.location = window.location.href.replace('#', '?');</script></html>"
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
            "<html><body>Spotify API connection was not successful: Code was not found!</body></html>"
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
