// Local imports
import { commandBeatmap } from "./osu/beatmap";
import { commandBeatmapRequests } from "./osu/beatmapRequests";
import { commandNp } from "./osu/np";
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";
import { commandScore } from "./osu/score";
import { handleTwitchCommand } from "../twitch";
// Type imports
import type { CommandHandlerBeatmapDataBase } from "./osu/beatmap";
import type { CommandHandlerNpDataBase } from "./osu/np";
import type { CommandHandlerPpRpDataBase } from "./osu/pp";
import type { CommandHandlerScoreDataBase } from "./osu/score";
import type { TwitchChatHandler } from "../twitch";

export interface OsuApiV2Credentials {
  clientId: number;
  clientSecret: string;
}

export interface BeatmapRequestsInfo {
  beatmapRequestsOn: boolean;
  beatmapRequestsOffMessage?: string;
  lastBeatmapId?: number;
}

const globalBeatmapRequestObject: BeatmapRequestsInfo = {
  beatmapRequestsOn: true,
};

export interface OsuChatHandlerData
  extends CommandHandlerPpRpDataBase,
    CommandHandlerNpDataBase,
    CommandHandlerScoreDataBase,
    CommandHandlerBeatmapDataBase {}

export const osuChatHandler: TwitchChatHandler<OsuChatHandlerData> = async (
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
) => {
  // Handle commands
  const commands = [commandNp, commandPp, commandRp];
  await Promise.all(
    commands.map((command) =>
      handleTwitchCommand(
        client,
        channel,
        tags,
        message,
        { ...data, beatmapRequestsInfo: globalBeatmapRequestObject },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command,
        enabled
      )
    )
  );
  // Why is this throwing an error?
  const commands2 = [commandScore];
  await Promise.all(
    commands2.map((command) =>
      handleTwitchCommand(
        client,
        channel,
        tags,
        message,
        { ...data, beatmapId: globalBeatmapRequestObject.lastBeatmapId },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command,
        enabled
      )
    )
  );
  await handleTwitchCommand(
    client,
    channel,
    tags,
    message,
    { ...data, beatmapRequestsInfo: globalBeatmapRequestObject },
    globalStrings,
    globalPlugins,
    globalMacros,
    logger,
    commandBeatmapRequests,
    enabled
  );
  if (globalBeatmapRequestObject.beatmapRequestsOn !== false) {
    await handleTwitchCommand(
      client,
      channel,
      tags,
      message,
      {
        ...data,
        beatmapRequestsInfo: globalBeatmapRequestObject,
      },
      globalStrings,
      globalPlugins,
      globalMacros,
      logger,
      commandBeatmap,
      enabled
    );
  }
};
