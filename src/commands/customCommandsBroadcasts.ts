// Local imports
// TODO Add commands
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

export interface CustomCommandsBroadcastsChatHandlerData
  extends CommandCustomCommandsBroadcastsGenericDataCustomCommandsBroadcastsDbPath,
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
  // TODO Add other commands
};
