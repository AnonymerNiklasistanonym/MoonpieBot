// Local imports
import { commandDelete, commandGet, commandSet } from "./moonpie/user";
import { commandAbout } from "./moonpie/about";
import { commandClaim } from "./moonpie/claim";
import { commandCommands } from "./moonpie/commands";
import { commandLeaderboard } from "./moonpie/leaderboard";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
import type { CommandClaimCreateReplyInput } from "./moonpie/claim";
import type { CommandGenericDetectorInputEnabledCommands } from "../twitch";
import type { TwitchChatHandler } from "../twitch";

export interface CommandMoonpieGenericDataMoonpieDbPath {
  /**
   * Database file path of the moonpie database.
   */
  moonpieDbPath: string;
}

export interface MoonpieChatHandlerData
  extends CommandMoonpieGenericDataMoonpieDbPath,
    CommandGenericDetectorInputEnabledCommands,
    CommandClaimCreateReplyInput {}

export const moonpieChatHandler: TwitchChatHandler<
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
    [commandSet].map((command) =>
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
    [commandGet, commandDelete].map((command) =>
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
