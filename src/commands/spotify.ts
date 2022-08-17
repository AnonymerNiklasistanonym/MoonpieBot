// Local imports
import { commandSong, CommandSongDetectorInput } from "./spotify/song";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
import type { CommandSongCreateReplyInput } from "./spotify/song";
import type { TwitchChatHandler } from "../twitch";

export interface SpotifyChatHandlerData
  extends CommandSongCreateReplyInput,
    CommandSongDetectorInput {}

export const spotifyChatHandler: TwitchChatHandler<
  SpotifyChatHandlerData
> = async (
  client,
  channel,
  tags,
  message,
  data,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
) => {
  // Handle commands
  await Promise.all(
    [commandSong].map((command) =>
      runTwitchCommandHandler(
        client,
        channel,
        tags,
        message,
        data,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command
      )
    )
  );
};
