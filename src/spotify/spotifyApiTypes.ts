export interface SpotifyApiErrorBody {
  error?: string;
  error_description?: string;
}

export interface SpotifyApiError extends Error {
  body?: SpotifyApiErrorBody;
}

export interface SpotifyApiResponse<T> {
  body: T;
  headers: Record<string, string>;
  statusCode: number;
}

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
