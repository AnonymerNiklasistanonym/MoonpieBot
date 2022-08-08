// Local imports
import { commandDelete, commandGet, commandSet } from "./moonpie/user";
import { commandAbout } from "./moonpie/about";
import { commandClaim } from "./moonpie/claim";
import { commandLeaderboard } from "./moonpie/leaderboard";
import { handleTwitchCommand } from "../twitch";
// Type imports
import type { CommandClaimData } from "./moonpie/claim";
import type { CommandCommandsData } from "./moonpie/commands";
import type { TwitchChatHandler } from "../twitch";

export interface CommandGenericDataMoonpieDbPath {
  /**
   * Database file path of the moonpie database.
   */
  moonpieDbPath: string;
}

export interface MoonpieChatHandlerData
  extends CommandClaimData,
    CommandCommandsData,
    CommandGenericDataMoonpieDbPath {}

export const moonpieChatHandler: TwitchChatHandler<
  MoonpieChatHandlerData
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
): Promise<void> => {
  // Handle commands
  const commands = [commandAbout, commandClaim, commandLeaderboard];
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
  const commands2 = [commandSet];
  await Promise.all(
    commands2.map((command) =>
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
  const commands3 = [commandGet, commandDelete];
  await Promise.all(
    commands3.map((command) =>
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
