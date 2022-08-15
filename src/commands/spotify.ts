// Type imports
import { runTwitchCommandHandler, TwitchChatHandler } from "../twitch";
import { commandSong } from "./spotify/song";

export interface SpotifyChatHandlerData {
  enabledCommands: string[];
}

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
  const commands = [commandSong];
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
};
