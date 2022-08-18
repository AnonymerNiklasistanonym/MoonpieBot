// Local imports
import { commandCommands } from "./spotify/commands";
import { commandSong } from "./spotify/song";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
import type {
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput,
} from "./spotify/commands";
import type {
  CommandSongCreateReplyInput,
  CommandSongDetectorInput,
} from "./spotify/song";
import type { TwitchChatHandler } from "../twitch";

export interface SpotifyChatHandlerData
  extends CommandCommandsCreateReplyInput,
    CommandCommandsDetectorInput,
    CommandSongCreateReplyInput,
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
  await Promise.all(
    [commandCommands].map((command) =>
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
