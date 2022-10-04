// Type imports
import type { MessageParserMacroGenerator } from "../macros";
import type { SpotifyGetCurrentAndRecentSongs } from "../../spotify";

export enum SpotifySongMacro {
  CURRENT_ALBUM = "CURRENT_ALBUM",
  CURRENT_ARTISTS = "CURRENT_ARTISTS",
  CURRENT_IS_SINGLE = "CURRENT_IS_SINGLE",
  CURRENT_TITLE = "CURRENT_TITLE",
  CURRENT_URL = "CURRENT_URL",
  HAS_CURRENT = "HAS_CURRENT",
  HAS_PREVIOUS = "HAS_PREVIOUS",
  PREVIOUS_ALBUM = "PREVIOUS_ALBUM",
  PREVIOUS_ARTISTS = "PREVIOUS_ARTISTS",
  PREVIOUS_IS_SINGLE = "PREVIOUS_IS_SINGLE",
  PREVIOUS_TITLE = "PREVIOUS_TITLE",
  PREVIOUS_URL = "PREVIOUS_URL",
}
export interface MacroSpotifySongData {
  spotifyData: SpotifyGetCurrentAndRecentSongs;
}
export const macroSpotifySong: MessageParserMacroGenerator<MacroSpotifySongData> =
  {
    exampleData: {
      spotifyData: {
        currentlyPlaying: {
          body: {
            item: {
              album: {
                album_type: "compilation",
                artists: [
                  {
                    external_urls: {
                      spotify:
                        "https://open.spotify.com/artist/0LyfQWJT6nXafLPZqxe9Of",
                    },
                    name: "Various Artists",
                    type: "artist",
                  },
                ],
                external_urls: {
                  spotify:
                    "https://open.spotify.com/album/1VGVJdmvOSRK2w9RKXk18A",
                },
                name: "Cyberpunk 2077: Radio, Vol. 2 (Original Soundtrack)",
                type: "album",
              },
              artists: [
                {
                  external_urls: {
                    spotify:
                      "https://open.spotify.com/artist/1X0HaTcdkHW7LviblBiEeq",
                  },
                  name: "Rosa Walton",
                  type: "artist",
                },
                {
                  external_urls: {
                    spotify:
                      "https://open.spotify.com/artist/5JNkPX6dYGLeEm4cUjHNGc",
                  },
                  name: "Hallie Coggins",
                  type: "artist",
                },
              ],
              external_urls: {
                spotify:
                  "https://open.spotify.com/track/7mykoq6R3BArsSpNDjFQTm",
              },
              name: "I Really Want to Stay at Your House",
              type: "track",
            },
          },
          statusCode: 200,
        },
        recentlyPlayedTracks: {
          body: {
            items: [
              {
                track: {
                  album: {
                    album_type: "album",
                    artists: [
                      {
                        external_urls: {
                          spotify:
                            "https://open.spotify.com/artist/2o3U0ld93tHYowkoari4Vi",
                        },
                        name: "Danger",
                        type: "artist",
                      },
                    ],
                    external_urls: {
                      spotify:
                        "https://open.spotify.com/album/7oBQawcEH4AvrUb1IgSI0p",
                    },
                    name: "??????",
                    type: "album",
                  },
                  artists: [
                    {
                      external_urls: {
                        spotify:
                          "https://open.spotify.com/artist/2o3U0ld93tHYowkoari4Vi",
                      },
                      name: "Danger",
                      type: "artist",
                    },
                  ],
                  external_urls: {
                    spotify:
                      "https://open.spotify.com/track/0LIrfIUgUR3pED0qKR6Wpz",
                  },
                  name: "11:02",
                  type: "track",
                },
              },
            ],
          },
          statusCode: 200,
        },
      } as unknown as SpotifyGetCurrentAndRecentSongs,
    },
    generate: (data) => {
      // Save output for example data:
      //// eslint-disable-next-line no-console
      //console.log(
      //  JSON.stringify(data, (key, val) => {
      //    if (
      //      [
      //        "actions",
      //        "available_markets",
      //        "context",
      //        "currently_playing_type",
      //        "cursors",
      //        "disc_number",
      //        "duration_ms",
      //        "explicit",
      //        "external_ids",
      //        "headers",
      //        "href",
      //        "id",
      //        "images",
      //        "is_local",
      //        "is_playing",
      //        "limit",
      //        "next",
      //        "played_at",
      //        "popularity",
      //        "preview_url",
      //        "progress_ms",
      //        "release_date_precision",
      //        "release_date",
      //        "timestamp",
      //        "total_tracks",
      //        "track_number",
      //        "uri",
      //      ].includes(key)
      //    ) {
      //      return undefined;
      //    }
      //    if (key === "items" && Array.isArray(val)) {
      //      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      //      return val.slice(0, 1);
      //    }
      //    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      //    return val;
      //  })
      //);
      const currData = data.spotifyData.currentlyPlaying.body.item;
      const hasCurrent = currData != null;

      const recentData = data.spotifyData.recentlyPlayedTracks.body.items;
      const hasPrevious = recentData.length > 0;
      const prevData = recentData[0];

      return Object.values(SpotifySongMacro).map<[SpotifySongMacro, string]>(
        (macroId) => {
          let macroValue;
          switch (macroId) {
            case SpotifySongMacro.CURRENT_ALBUM:
              if (
                hasCurrent &&
                currData.type === "track" &&
                currData.album.album_type !== "single"
              ) {
                macroValue = currData.album.name;
              }
              break;
            case SpotifySongMacro.CURRENT_ARTISTS:
              if (hasCurrent && currData.type === "track") {
                macroValue = currData.artists.map((a) => a.name).join(", ");
              }
              break;
            case SpotifySongMacro.CURRENT_IS_SINGLE:
              macroValue =
                hasCurrent &&
                currData.type === "track" &&
                currData.album.album_type === "single";
              break;
            case SpotifySongMacro.CURRENT_TITLE:
              if (hasCurrent && currData.type === "track") {
                macroValue = currData.name;
              }
              break;
            case SpotifySongMacro.CURRENT_URL:
              if (hasCurrent) {
                macroValue = currData.external_urls.spotify;
              }
              break;
            case SpotifySongMacro.HAS_CURRENT:
              macroValue = hasCurrent;
              break;
            case SpotifySongMacro.HAS_PREVIOUS:
              macroValue = hasPrevious;
              break;
            case SpotifySongMacro.PREVIOUS_ALBUM:
              if (hasPrevious) {
                macroValue = prevData.track.album.name;
              }
              break;
            case SpotifySongMacro.PREVIOUS_ARTISTS:
              macroValue = hasPrevious
                ? prevData.track.artists.map((a) => a.name).join(", ")
                : undefined;
              break;
            case SpotifySongMacro.PREVIOUS_IS_SINGLE:
              macroValue =
                hasPrevious && prevData.track.album.album_type === "single";
              break;
            case SpotifySongMacro.PREVIOUS_TITLE:
              macroValue = hasPrevious ? prevData.track.name : undefined;
              break;
            case SpotifySongMacro.PREVIOUS_URL:
              macroValue = hasPrevious
                ? prevData.track.external_urls.spotify
                : undefined;
              break;
          }
          if (typeof macroValue === "boolean") {
            macroValue = macroValue ? "true" : "false";
          }
          if (typeof macroValue === "undefined") {
            macroValue = "undefined";
          }
          return [macroId, macroValue];
        }
      );
    },
    id: "SPOTIFY_SONG",
    keys: Object.values(SpotifySongMacro),
  };
