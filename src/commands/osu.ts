// Local imports
import { commandBeatmap } from "./osu/beatmap";
import { commandBeatmapLastRequest } from "./osu/beatmapLastRequest";
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
  CommandBeatmapLastRequestCreateReplyInput,
  CommandBeatmapLastRequestDetectorInput,
} from "./osu/beatmapLastRequest";
import type {
  CommandBeatmapRequestsCreateReplyInput,
  CommandBeatmapRequestsDetectorInput,
} from "./osu/beatmapRequests";
import {
  commandCommands,
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput,
} from "./osu/commands";
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
import type { Beatmap } from "osu-api-v2";
import type { TwitchChatHandler } from "../twitch";

export interface OsuApiV2Credentials {
  clientId: number;
  clientSecret: string;
}

export interface BeatmapRequestsListElement {
  comment?: string;
  data: Beatmap;
  id: number;
  userId?: string;
  userName?: string;
}

export interface BeatmapRequestsInfo {
  beatmapRequestsOffMessage?: string;
  beatmapRequestsOn: boolean;
  lastMentionedBeatmapId?: number;
  previousBeatmapRequests: BeatmapRequestsListElement[];
}

const globalBeatmapRequestObject: BeatmapRequestsInfo = {
  beatmapRequestsOn: true,
  previousBeatmapRequests: [],
};

export interface OsuChatHandlerData
  extends CommandCommandsCreateReplyInput,
    CommandCommandsDetectorInput,
    CommandNpCreateReplyInput,
    CommandNpDetectorInput,
    CommandPpRpCreateReplyInput,
    CommandPpRpDetectorInput,
    CommandScoreCreateReplyInput,
    CommandScoreDetectorInput,
    CommandBeatmapCreateReplyInput,
    CommandBeatmapDetectorInput,
    CommandBeatmapLastRequestCreateReplyInput,
    CommandBeatmapLastRequestDetectorInput,
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
    [commandBeatmapLastRequest].map((command) =>
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
