// Local imports
// TODO Add commands
import {
  commandAddCB,
  commandDelCB,
} from "./customCommandsBroadcasts/customBroadcasts";
import {
  commandAddCC,
  commandDelCC,
} from "./customCommandsBroadcasts/customCommands";
import { commandCommands } from "./customCommandsBroadcasts/commands";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
// TODO Add types from command inputs
import type { CommandGenericDetectorInputEnabledCommands } from "../twitch";
import type { TwitchChatHandler } from "../twitch";

export interface CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath {
  /**
   * Database file path of the custom commands/broadcasts database.
   */
  customCommandsBroadcastsDbPath: string;
}
export interface CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper {
  /**
   * Helper object to refresh custom commands/broadcasts if they are updated.
   */
  customCommandsBroadcastsRefreshHelper: CustomCommandsBroadcastsRefreshHelper;
}

export interface CustomCommandsBroadcastsRefreshHelper {
  /** If set to true custom broadcasts will be refreshed. */
  refreshCustomBroadcasts: boolean;
  /** If set to true custom commands will be refreshed. */
  refreshCustomCommands: boolean;
}

export interface CustomCommandsBroadcastsChatHandlerData
  extends CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath,
    CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsRefreshHelper,
    CommandGenericDetectorInputEnabledCommands {}

export const customCommandsBroadcastsChatHandler: TwitchChatHandler<
  CustomCommandsBroadcastsChatHandlerData
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
  await Promise.all(
    [commandAddCC].map((command) =>
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
    [commandDelCC].map((command) =>
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
    [commandAddCB].map((command) =>
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
    [commandDelCB].map((command) =>
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
  // TODO Add other commands
};
