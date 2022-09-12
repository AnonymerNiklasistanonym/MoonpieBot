// Local imports
import { commandBeatmap } from "./osu/beatmap";
import { commandBeatmapLastRequest } from "./osu/beatmapLastRequest";
import { commandBeatmapPermitRequest } from "./osu/beatmapPermitRequest";
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
  CommandBeatmapPermitRequestCreateReplyInput,
  CommandBeatmapPermitRequestDetectorInput,
} from "./osu/beatmapPermitRequest";
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

/**
 * Information about a beatmap request.
 */
export interface BeatmapRequestInfo {
  /** Optional beatmap request comment. */
  comment?: string;
  /** Beatmap request fetched raw data. */
  data: Beatmap;
  /** Twitch user ID of requestor. */
  userId: string;
  /** Twitch user name of requestor. */
  userName: string;
}

/**
 * Dynamic beatmap request information that can be shared across commands.
 */
export interface BeatmapRequestsInfo {
  /** A custom beatmap requests off message. */
  beatmapRequestsOffMessage?: string;
  /**
   * Indicator if beatmap requests are currently enabled.
   * The configuration value can still be false and thus needs to be checked!
   */
  beatmapRequestsOn: boolean;
  /** The last blocked beatmap request this session. */
  blockedBeatmapRequest?: BeatmapRequestInfo;
  /** The last mentioned beatmap ID this session. */
  lastMentionedBeatmapId?: number;
  /** A list of previous beatmap requests this session. */
  previousBeatmapRequests: BeatmapRequestInfo[];
}

/**
 * Session object to share dynamic beatmap request information across commands
 * next to the provided static values from the configuration.
 */
const beatmapRequestsInfo: BeatmapRequestsInfo = {
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
    CommandBeatmapPermitRequestCreateReplyInput,
    CommandBeatmapPermitRequestDetectorInput,
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
        { ...data, beatmapRequestsInfo },
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
        { ...data, beatmapRequestsInfo },
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
        { ...data, beatmapRequestsInfo },
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
        { ...data, beatmapRequestsInfo },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command
      )
    )
  );
  await Promise.all(
    [commandBeatmapPermitRequest].map((command) =>
      runTwitchCommandHandler(
        client,
        channel,
        tags,
        message,
        { ...data, beatmapRequestsInfo },
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
        { ...data, beatmapRequestsInfo },
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
