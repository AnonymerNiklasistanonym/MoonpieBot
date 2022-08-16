// Local imports
import { commandBeatmap } from "./osu/beatmap";
import { commandBeatmapRequests } from "./osu/beatmapRequests";
import { commandNp } from "./osu/np";
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";
import { commandScore } from "./osu/score";
import { runTwitchCommandHandler } from "../twitch";
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
  beatmapRequestsOffMessage?: string;
  beatmapRequestsOn: boolean;
  lastBeatmapId?: number;
}

const globalBeatmapRequestObject: BeatmapRequestsInfo = {
  beatmapRequestsOn: true,
};

interface OsuChatHandlerData
  extends CommandHandlerPpRpDataBase,
    CommandHandlerNpDataBase,
    CommandHandlerScoreDataBase,
    CommandHandlerBeatmapDataBase {
  enabledCommands: string[];
}

export const osuChatHandler: TwitchChatHandler<OsuChatHandlerData> = async (
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
  const commands = [commandNp, commandPp, commandRp];
  await Promise.all(
    commands.map((command) =>
      runTwitchCommandHandler(
        client,
        channel,
        tags,
        message,
        { ...data, beatmapRequestsInfo: globalBeatmapRequestObject },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command
      )
    )
  );
  // Why is this throwing an error?
  await runTwitchCommandHandler(
    client,
    channel,
    tags,
    message,
    { ...data, beatmapId: globalBeatmapRequestObject.lastBeatmapId },
    globalStrings,
    globalPlugins,
    globalMacros,
    logger,
    commandScore
  );
  await runTwitchCommandHandler(
    client,
    channel,
    tags,
    message,
    { ...data, beatmapRequestsInfo: globalBeatmapRequestObject },
    globalStrings,
    globalPlugins,
    globalMacros,
    logger,
    commandBeatmapRequests
  );
  await runTwitchCommandHandler(
    client,
    channel,
    tags,
    message,
    {
      ...data,
      beatmapRequestsInfo: globalBeatmapRequestObject,
      beatmapRequestsOn: globalBeatmapRequestObject.beatmapRequestsOn,
    },
    globalStrings,
    globalPlugins,
    globalMacros,
    logger,
    commandBeatmap
  );
};
