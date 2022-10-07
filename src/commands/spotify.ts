// Local imports
import { commandCommands } from "./spotify/commands";
import { commandSong } from "./spotify/song";
import { runChatMessageHandlerReplyCreator } from "../chatMessageHandler";
// Type imports
import type {
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput,
} from "./spotify/commands";
import type {
  CommandSongCreateReplyInput,
  CommandSongDetectorInput,
} from "./spotify/song";
import type { ChatMessageHandler } from "../chatMessageHandler";

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
  logger
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
        command
      )
    )
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
        command
      )
    )
  );
};
