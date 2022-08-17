// Local imports
import { commandBeatmap } from "./osu/beatmap";
import { commandBeatmapRequests } from "./osu/beatmapRequests";
import { commandNp } from "./osu/np";
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";
import { commandScore } from "./osu/score";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
import type {
  CommandBeatmapCreateReplyInput,
  CommandBeatmapDetectorInput,
} from "./osu/beatmap";
import type {
  CommandBeatmapRequestsCreateReplyInput,
  CommandBeatmapRequestsDetectorInput,
} from "./osu/beatmapRequests";
import type {
  CommandNpCreateReplyInput,
  CommandNpDetectorInput,
} from "./osu/np";
import type {
  CommandPpRpCreateReplyInput,
  CommandPpRpDetectorInput,
} from "./osu/pp";
import type {
  CommandScoreCreateReplyInput,
  CommandScoreDetectorInput,
} from "./osu/score";
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

export interface OsuChatHandlerData
  extends CommandNpCreateReplyInput,
    CommandNpDetectorInput,
    CommandPpRpCreateReplyInput,
    CommandPpRpDetectorInput,
    CommandScoreCreateReplyInput,
    CommandScoreDetectorInput,
    CommandBeatmapCreateReplyInput,
    CommandBeatmapDetectorInput,
    CommandBeatmapRequestsCreateReplyInput,
    CommandBeatmapRequestsDetectorInput {}

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
  await Promise.all(
    [commandNp, commandPp, commandRp].map((command) =>
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
  await Promise.all(
    [commandScore].map((command) =>
      runTwitchCommandHandler(
        client,
        channel,
        tags,
        message,
        { ...data, beatmapId: globalBeatmapRequestObject.lastBeatmapId },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command
      )
    )
  );
  await Promise.all(
    [commandBeatmapRequests].map((command) =>
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
  await Promise.all(
    [commandBeatmap].map((command) =>
      runTwitchCommandHandler(
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
        command
      )
    )
  );
};
