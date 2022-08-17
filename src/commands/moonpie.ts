// Local imports
import { commandDelete, commandGet, commandSet } from "./moonpie/user";
import { commandAbout } from "./moonpie/about";
import { commandClaim } from "./moonpie/claim";
import { commandCommands } from "./moonpie/commands";
import { commandLeaderboard } from "./moonpie/leaderboard";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
import type {
  CommandClaimCreateReplyInput,
  CommandClaimDetectorInput,
} from "./moonpie/claim";
import type {
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput,
} from "./moonpie/commands";
import type {
  CommandDeleteCreateReplyInput,
  CommandDeleteDetectorInput,
  CommandGetCreateReplyInput,
  CommandGetDetectorInput,
  CommandSetCreateReplyInput,
  CommandSetDetectorInput,
} from "./moonpie/user";
import type {
  CommandLeaderboardCreateReplyInput,
  CommandLeaderboardDetectorInput,
} from "./moonpie/leaderboard";
import type { TwitchChatHandler } from "../twitch";

export interface CommandGenericDataMoonpieDbPath {
  /**
   * Database file path of the moonpie database.
   */
  moonpieDbPath: string;
}

export interface MoonpieChatHandlerData
  extends CommandClaimDetectorInput,
    CommandCommandsCreateReplyInput,
    CommandCommandsDetectorInput,
    CommandDeleteCreateReplyInput,
    CommandDeleteDetectorInput,
    CommandGetCreateReplyInput,
    CommandGetDetectorInput,
    CommandLeaderboardCreateReplyInput,
    CommandLeaderboardDetectorInput,
    CommandSetCreateReplyInput,
    CommandSetDetectorInput,
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
