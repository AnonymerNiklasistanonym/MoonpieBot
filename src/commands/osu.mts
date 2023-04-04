// Relative imports
import {
  commandBeatmapRequests,
  commandBeatmapRequestsSetUnset,
} from "./osu/requests.mjs";
import { commandBeatmap } from "./osu/beatmap.mjs";
import { commandBeatmapLastRequest } from "./osu/lastRequest.mjs";
import { commandBeatmapPermitRequest } from "./osu/permitRequest.mjs";
import { commandCommands } from "./osu/commands.mjs";
import { commandNp } from "./osu/np.mjs";
import { commandPp } from "./osu/pp.mjs";
import { commandRp } from "./osu/rp.mjs";
import { commandScore } from "./osu/score.mjs";
import { runChatMessageHandlerReplyCreator } from "../chatMessageHandler.mjs";
// Type imports
import type {
  ChatMessageHandler,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../chatMessageHandler.mjs";
import type {
  CommandBeatmapCreateReplyInput,
  OsuIrcBotSendMessageFunc,
} from "./osu/beatmap.mjs";
import type { Beatmap } from "osu-api-v2";
import type { CommandPpRpCreateReplyInput } from "./osu/pp.mjs";
import type { StreamCompanionConnection } from "../osuStreamCompanion.mjs";

export interface CommandOsuGenericDataOsuApiDbPath {
  /**
   * Database file path of the osu api database.
   */
  osuApiDbPath: string;
}

export interface CommandOsuGenericDataOsuApiV2Credentials {
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials: Readonly<OsuApiV2Credentials>;
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

export interface CommandOsuGenericDataStreamCompanionFunc {
  /**
   * If available get the current map data using StreamCompanion.
   */
  osuStreamCompanionCurrentMapData?: StreamCompanionConnection;
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

export interface OsuChatHandlerDataOsuApi
  extends CommandOsuGenericDataOsuApiDbPath,
    CommandOsuGenericDataOsuApiV2Credentials,
    CommandOsuGenericDataOsuIrcData,
    CommandOsuGenericDataStreamCompanionFunc,
    ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
    CommandPpRpCreateReplyInput,
    CommandBeatmapCreateReplyInput {}
export interface OsuChatHandlerDataStreamCompanionOnly
  extends ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
    Required<CommandOsuGenericDataStreamCompanionFunc> {}

export const osuChatHandler: ChatMessageHandler<
  OsuChatHandlerDataOsuApi | OsuChatHandlerDataStreamCompanionOnly
> = async (
  client,
  channel,
  tags,
  message,
  data,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger,
) => {
  // Handle commands
  await Promise.all(
    [commandNp].map((command) =>
      runChatMessageHandlerReplyCreator(
        client,
        channel,
        tags,
        message,
        { ...data, beatmapRequestsInfo },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command,
      ),
    ),
  );
  await Promise.all(
    [commandCommands].map((command) =>
      runChatMessageHandlerReplyCreator(
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
      ),
    ),
  );
  if ("osuApiDbPath" in data) {
    await Promise.all(
      [commandPp, commandRp].map((command) =>
        runChatMessageHandlerReplyCreator(
          client,
          channel,
          tags,
          message,
          { ...data, beatmapRequestsInfo },
          globalStrings,
          globalPlugins,
          globalMacros,
          logger,
          command,
        ),
      ),
    );
    await Promise.all(
      [commandScore].map((command) =>
        runChatMessageHandlerReplyCreator(
          client,
          channel,
          tags,
          message,
          { ...data, beatmapRequestsInfo },
          globalStrings,
          globalPlugins,
          globalMacros,
          logger,
          command,
        ),
      ),
    );
    await Promise.all(
      [commandBeatmapRequests].map((command) =>
        runChatMessageHandlerReplyCreator(
          client,
          channel,
          tags,
          message,
          { ...data, beatmapRequestsInfo },
          globalStrings,
          globalPlugins,
          globalMacros,
          logger,
          command,
        ),
      ),
    );
    await Promise.all(
      [commandBeatmapRequestsSetUnset].map((command) =>
        runChatMessageHandlerReplyCreator(
          client,
          channel,
          tags,
          message,
          { ...data, beatmapRequestsInfo },
          globalStrings,
          globalPlugins,
          globalMacros,
          logger,
          command,
        ),
      ),
    );
    await Promise.all(
      [commandBeatmapLastRequest].map((command) =>
        runChatMessageHandlerReplyCreator(
          client,
          channel,
          tags,
          message,
          { ...data, beatmapRequestsInfo },
          globalStrings,
          globalPlugins,
          globalMacros,
          logger,
          command,
        ),
      ),
    );
    await Promise.all(
      [commandBeatmapPermitRequest].map((command) =>
        runChatMessageHandlerReplyCreator(
          client,
          channel,
          tags,
          message,
          { ...data, beatmapRequestsInfo },
          globalStrings,
          globalPlugins,
          globalMacros,
          logger,
          command,
        ),
      ),
    );
    await Promise.all(
      [commandBeatmap].map((command) =>
        runChatMessageHandlerReplyCreator(
          client,
          channel,
          tags,
          message,
          { ...data, beatmapRequestsInfo },
          globalStrings,
          globalPlugins,
          globalMacros,
          logger,
          command,
        ),
      ),
    );
  }
};
