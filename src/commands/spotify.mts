// Relative imports
import { commandCommands } from "./spotify/commands.mjs";
import { commandSong } from "./spotify/song.mjs";
import { runChatMessageHandlerReplyCreator } from "../chatMessageHandler.mjs";
// Type imports
import type {
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput,
} from "./spotify/commands.mjs";
import type {
  CommandSongCreateReplyInput,
  CommandSongDetectorInput,
} from "./spotify/song.mjs";
import type { ChatMessageHandler } from "../chatMessageHandler.mjs";

export interface SpotifyChatHandlerData
  extends CommandCommandsCreateReplyInput,
    CommandCommandsDetectorInput,
    CommandSongCreateReplyInput,
    CommandSongDetectorInput {}

export const spotifyChatHandler: ChatMessageHandler<
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
  logger,
) => {
  // Handle commands
  await Promise.all(
    [commandSong].map((command) =>
      runChatMessageHandlerReplyCreator(
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
      ),
    ),
  );
  await Promise.all(
    [commandCommands].map((command) =>
      runChatMessageHandlerReplyCreator(
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
      ),
    ),
  );
};
