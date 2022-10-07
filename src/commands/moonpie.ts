// Local imports
import { commandDelete, commandGet, commandSet } from "./moonpie/user";
import { commandAbout } from "./moonpie/about";
import { commandClaim } from "./moonpie/claim";
import { commandCommands } from "./moonpie/commands";
import { commandLeaderboard } from "./moonpie/leaderboard";
import { runChatMessageHandlerReplyCreator } from "../chatMessageHandler";
// Type imports
import type {
  ChatMessageHandler,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../chatMessageHandler";
import type { CommandClaimCreateReplyInput } from "./moonpie/claim";

export interface CommandMoonpieGenericDataMoonpieDbPath {
  /**
   * Database file path of the moonpie database.
   */
  moonpieDbPath: string;
}

export interface MoonpieChatHandlerData
  extends CommandMoonpieGenericDataMoonpieDbPath,
    ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
    CommandClaimCreateReplyInput {}

export const moonpieChatHandler: ChatMessageHandler<
  MoonpieChatHandlerData
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
): Promise<void> => {
  // Handle commands
  await Promise.all(
    [commandAbout, commandClaim, commandLeaderboard].map((command) =>
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
    [commandSet].map((command) =>
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
    [commandGet, commandDelete].map((command) =>
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
