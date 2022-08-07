// Type imports
import { handleTwitchCommand, TwitchChatHandler } from "../twitch";
import { commandSong } from "./spotify/song";

/**
 * The logging ID of this command.
 */
export const LOG_ID_COMMAND_SPOTIFY = "spotify";
/**
 * The logging ID of this module.
 */
export const LOG_ID_MODULE_SPOTIFY = "spotify";

export interface Album {
  album_type: string;
  artists: AlbumArtist[];
  name: string;
}
export interface ItemAlbum {
  album: Album;
}
export interface AlbumArtist {
  name: string;
}
export interface ItemArtist {
  artists: Artist[];
}
export interface Artist {
  name: string;
}

export const spotifyChatHandler: TwitchChatHandler<
  Record<never, never>
> = async (
  client,
  channel,
  tags,
  message,
  data,
  enabled,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
) => {
  // Handle commands
  const commands = [commandSong];
  await Promise.all(
    commands.map((command) =>
      handleTwitchCommand(
        client,
        channel,
        tags,
        message,
        data,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command,
        enabled
      )
    )
  );
};
