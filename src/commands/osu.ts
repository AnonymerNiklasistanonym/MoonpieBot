// Local imports
import { commandBeatmap, CommandHandlerBeatmapData } from "./osu/beatmap";
import { CommandHandlerScoreDataBase, commandScore } from "./osu/score";
import { commandBeatmapRequests } from "./osu/beatmapRequests";
import { commandNp } from "./osu/np";
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";
import { handleTwitchCommand } from "../twitch";
// Type imports
import type { CommandHandlerNpData } from "./osu/np";
import type { CommandHandlerPpRpData } from "./osu/pp";
import type { TwitchChatHandler } from "../twitch";

export interface OsuApiV2Credentials {
  clientId: number;
  clientSecret: string;
}

export interface BeatmapRequestsInfo {
  beatmapRequestsOn: boolean;
  beatmapRequestsOffMessage?: string;
}

interface GlobalBeatmapRequestInfo extends BeatmapRequestsInfo {
  lastBeatmapId?: number;
}

const globalBeatmapRequestObject: GlobalBeatmapRequestInfo = {
  beatmapRequestsOn: true,
};

export interface OsuChatHandlerData
  extends CommandHandlerPpRpData,
    CommandHandlerNpData,
    CommandHandlerScoreDataBase,
    CommandHandlerBeatmapData {}

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
  await handleTwitchCommand(
    client,
    channel,
    tags,
    message,
    {
      ...data,
      enableOsuBeatmapRequestsDetailed: data.enableOsuBeatmapRequestsDetailed,
      enableOsuBeatmapRequests:
        data.enableOsuBeatmapRequests &&
        globalBeatmapRequestObject.beatmapRequestsOn,
      beatmapRequestsOffMessage:
        globalBeatmapRequestObject.beatmapRequestsOffMessage,
    },
    globalStrings,
    globalPlugins,
    globalMacros,
    logger,
    commandBeatmap,
    enabled
  );
};
