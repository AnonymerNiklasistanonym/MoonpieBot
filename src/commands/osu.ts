// Local imports
import {
  commandBeatmapRequests,
  commandBeatmapRequestsSetUnset,
} from "./osu/requests";
import { commandBeatmap } from "./osu/beatmap";
import { commandBeatmapLastRequest } from "./osu/lastRequest";
import { commandBeatmapPermitRequest } from "./osu/permitRequest";
import { commandCommands } from "./osu/commands";
import { commandNp } from "./osu/np";
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";
import { commandScore } from "./osu/score";
import { runTwitchCommandHandler } from "../twitch";
// Type imports
import type {
  CommandBeatmapRequestsSetUnsetCreateReplyInput,
  CommandBeatmapRequestsSetUnsetDetectorInput,
} from "./osu/requests";
import type { Beatmap } from "osu-api-v2";
import type { CommandBeatmapCreateReplyInput } from "./osu/beatmap";
import type { CommandBeatmapLastRequestCreateReplyInput } from "./osu/lastRequest";
import type { CommandCommandsCreateReplyInput } from "./osu/commands";
import type { CommandGenericDetectorInputEnabledCommands } from "../twitch";
import type { CommandNpCreateReplyInput } from "./osu/np";
import type { CommandPpRpCreateReplyInput } from "./osu/pp";
import type { CommandScoreCreateReplyInput } from "./osu/score";
import type { OsuIrcBotSendMessageFunc } from "./osu/beatmap";
import type { TwitchChatHandler } from "../twitch";

export interface CommandOsuGenericDataOsuApiDbPath {
  /**
   * Database file path of the osu api database.
   */
  osuApiDbPath?: string;
}

export interface CommandOsuGenericDataOsuApiV2Credentials {
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: Readonly<OsuApiV2Credentials>;
}

export interface CommandOsuGenericDataOsuIrcData {
  /**
   * The osu IRC bot with which messages can be sent.
   */
  osuIrcBot?: OsuIrcBotSendMessageFunc;
  /**
   * The osu IRC request target.
   */
  osuIrcRequestTarget?: string;
}

export interface CommandOsuGenericDataExtraBeatmapRequestsInfo {
  /**
   * Dynamic beatmap request information that can be shared across commands.
   * Is only available to the osu chat handler.
   */
  beatmapRequestsInfo: BeatmapRequestsInfo;
}

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
  previousBeatmapRequests: [],
};

export interface OsuChatHandlerData
  extends CommandOsuGenericDataOsuApiDbPath,
    CommandOsuGenericDataOsuApiV2Credentials,
    CommandOsuGenericDataOsuIrcData,
    CommandGenericDetectorInputEnabledCommands,
    CommandCommandsCreateReplyInput,
    CommandNpCreateReplyInput,
    CommandPpRpCreateReplyInput,
    CommandScoreCreateReplyInput,
    CommandBeatmapCreateReplyInput,
    CommandBeatmapLastRequestCreateReplyInput,
    CommandBeatmapRequestsSetUnsetDetectorInput,
    CommandBeatmapRequestsSetUnsetCreateReplyInput {}

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
    [commandBeatmapRequestsSetUnset].map((command) =>
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
