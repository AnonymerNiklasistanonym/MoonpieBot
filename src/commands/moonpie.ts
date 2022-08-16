// Local imports
import { commandDelete, commandGet, commandSet } from "./moonpie/user";
import { commandAbout } from "./moonpie/about";
import { commandClaim } from "./moonpie/claim";
import { commandLeaderboard } from "./moonpie/leaderboard";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
import type {
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
  TwitchChatHandler,
} from "../twitch";
import type { CommandClaimData } from "./moonpie/claim";

export interface CommandGenericDataMoonpieDbPath {
  /**
   * Database file path of the moonpie database.
   */
  moonpieDbPath: string;
}

interface MoonpieChatHandlerData
  extends CommandClaimData,
    TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
    CommandGenericDataMoonpieDbPath {}

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
  const commands = [commandAbout, commandClaim, commandLeaderboard];
  await Promise.all(
    commands.map((command) =>
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
  const commands2 = [commandSet];
  await Promise.all(
    commands2.map((command) =>
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
  const commands3 = [commandGet, commandDelete];
  await Promise.all(
    commands3.map((command) =>
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
