import { spotifyGetCurrentSongAndRecentlyPlayedSongs } from "../../spotify";
import type SpotifyWebApi from "spotify-web-api-node";
import type { MessageParserPlugin } from "../plugins";
import type { MacroDictionaryEntry } from "../../messageParser";
import type { ItemAlbum, ItemArtist } from "../../commands/spotify";

export const pluginSpotifyCurrentPreviousSong = (
  spotifyWebApi: SpotifyWebApi
): MessageParserPlugin => {
  return {
    id: "SPOTIFY_SONG",
    func: async (logger) => {
      const data = await spotifyGetCurrentSongAndRecentlyPlayedSongs(
        spotifyWebApi,
        logger
      );
      const macros: MacroDictionaryEntry[] = [];
      const currData = data?.currentlyPlaying.body.item;
      const hasCurrent = currData != null && currData !== undefined;
      macros.push(["HAS_CURRENT", hasCurrent ? "true" : "false"]);
      if (hasCurrent) {
        const album = (currData as unknown as ItemAlbum).album;
        const artist = (currData as unknown as ItemArtist).artists;
        macros.push(["CURRENT_TITLE", currData.name]);
        macros.push(["CURRENT_ARTISTS", artist?.map((a) => a.name).join(", ")]);
        macros.push([
          "CURRENT_IS_SINGLE",
          album.album_type === "single" ? "true" : "false",
        ]);
        if (album.album_type !== "single") {
          macros.push(["CURRENT_ALBUM", album.name]);
        }
        macros.push(["CURRENT_URL", currData.external_urls.spotify]);
      }
      const recentData = data?.recentlyPlayedTracks.body.items;
      const hasRecent =
        recentData != null && recentData !== undefined && recentData.length > 0;
      macros.push(["HAS_PREVIOUS", hasRecent ? "true" : "false"]);
      if (hasRecent) {
        const previousSong = recentData[0];
        macros.push(["PREVIOUS_TITLE", previousSong.track.name]);
        macros.push([
          "PREVIOUS_ARTISTS",
          previousSong.track.artists?.map((a) => a.name).join(", "),
        ]);
        macros.push([
          "PREVIOUS_IS_SINGLE",
          previousSong.track.album.album_type === "single" ? "true" : "false",
        ]);
        if (previousSong.track.album.album_type !== "single") {
          macros.push(["PREVIOUS_ALBUM", previousSong.track.album.name]);
        }
        macros.push(["PREVIOUS_URL", previousSong.track.external_urls.spotify]);
      }
      logger.info(macros);
      return macros;
    },
  };
};
