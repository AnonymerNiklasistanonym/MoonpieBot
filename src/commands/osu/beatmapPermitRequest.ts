// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";

import {
  osuBeatmapRequest,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNoBlockedRequestsError,
  osuBeatmapRequestPermissionError,
} from "../../strings/osu/beatmapRequest";
import {
  parseTwitchBadgeLevel,
  TwitchBadgeLevels,
} from "../../other/twitchBadgeParser";
import { BeatmapRequestsInfo } from "../osu";
import { createLogFunc } from "../../logging";
import { generatePlugin } from "../../messageParser/plugins";
import { macroOsuBeatmap } from "../../messageParser/macros/osuApi";
import { macroOsuBeatmapRequest } from "../../messageParser/macros/osuBeatmapRequest";
import { messageParserById } from "../../messageParser";
import { pluginsTwitchChatGenerator } from "../../messageParser/plugins/twitchChat";
import { regexOsuChatHandlerCommandPermitRequest } from "../../info/regex";
import { tryToSendOsuIrcMessage } from "../../osuIrc";
// Type imports
import type { EMPTY_OBJECT } from "../../info/other";
import type { OsuIrcBotSendMessageFunc } from "./beatmap";
import type { PluginTwitchChatData } from "../../messageParser/plugins/twitchChat";
import type { TwitchChatCommandHandler } from "../../twitch";

export type CommandBeatmapPermitRequestCreateReplyInput = EMPTY_OBJECT;
export interface CommandBeatmapPermitRequestCreateReplyInputExtra
  extends CommandBeatmapPermitRequestCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
  enableOsuBeatmapRequestsDetailed?: boolean;
  osuIrcBot?: OsuIrcBotSendMessageFunc;
  osuIrcRequestTarget?: string;
}
export interface CommandBeatmapPermitRequestDetectorInput {
  enabledCommands: string[];
}
/**
 * Post information about the last blocked request in chat and send them
 * if enabled via IRC to the client.
 */
export const commandBeatmapPermitRequest: TwitchChatCommandHandler<
  CommandBeatmapPermitRequestCreateReplyInputExtra,
  CommandBeatmapPermitRequestDetectorInput
> = {
  createReply: async (
    client,
    channel,
    tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    const logCmdBeatmap = createLogFunc(
      logger,
      LOG_ID_CHAT_HANDLER_OSU,
      "beatmapPermitRequest"
    );

    const twitchBadgeLevel = parseTwitchBadgeLevel(tags);
    if (
      twitchBadgeLevel !== TwitchBadgeLevels.BROADCASTER &&
      twitchBadgeLevel !== TwitchBadgeLevels.MODERATOR
    ) {
      const errorMessage = await messageParserById(
        osuBeatmapRequestPermissionError.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      throw Error(errorMessage);
    }

    const blockedBeatmapRequest =
      data.beatmapRequestsInfo.blockedBeatmapRequest;

    if (blockedBeatmapRequest === undefined) {
      const errorMessage = await messageParserById(
        osuBeatmapRequestNoBlockedRequestsError.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      throw Error(errorMessage);
    }

    const osuBeatmapRequestMacros = new Map(globalMacros);
    osuBeatmapRequestMacros.set(
      macroOsuBeatmapRequest.id,
      new Map(
        macroOsuBeatmapRequest.generate({
          comment: blockedBeatmapRequest.comment?.trim(),
          id: blockedBeatmapRequest.id,
        })
      )
    );
    osuBeatmapRequestMacros.set(
      macroOsuBeatmap.id,
      new Map(macroOsuBeatmap.generate({ beatmap: blockedBeatmapRequest.data }))
    );

    const osuBeatmapRequestPlugins = new Map(globalPlugins);
    pluginsTwitchChatGenerator.forEach((a) => {
      const plugin = generatePlugin<PluginTwitchChatData>(a, {
        channelName: channel.slice(1),
        userId: blockedBeatmapRequest.userId,
        userName: blockedBeatmapRequest.userName,
      });
      osuBeatmapRequestPlugins.set(plugin.id, plugin.func);
    });

    data.beatmapRequestsInfo.previousBeatmapRequests.unshift({
      comment: blockedBeatmapRequest.comment?.trim(),
      data: blockedBeatmapRequest.data,
      id: blockedBeatmapRequest.id,
      userId: tags["user-id"],
      userName: tags.username,
    });
    data.beatmapRequestsInfo.blockedBeatmapRequest = undefined;

    let messageRequest = "";
    let messageRequestIrc = "";

    if (data.enableOsuBeatmapRequestsDetailed) {
      messageRequest = await messageParserById(
        osuBeatmapRequestDetailed.id,
        globalStrings,
        osuBeatmapRequestPlugins,
        osuBeatmapRequestMacros,
        logger
      );
      messageRequestIrc = await messageParserById(
        osuBeatmapRequestIrcDetailed.id,
        globalStrings,
        osuBeatmapRequestPlugins,
        osuBeatmapRequestMacros,
        logger
      );
    } else {
      messageRequest = await messageParserById(
        osuBeatmapRequest.id,
        globalStrings,
        osuBeatmapRequestPlugins,
        osuBeatmapRequestMacros,
        logger
      );
      messageRequestIrc = await messageParserById(
        osuBeatmapRequestIrc.id,
        globalStrings,
        osuBeatmapRequestPlugins,
        osuBeatmapRequestMacros,
        logger
      );
    }
    // Send response to Twitch channel and if found to IRC channel
    const sentMessage = await client.say(channel, messageRequest);

    if (data.osuIrcRequestTarget && data.osuIrcBot !== undefined) {
      logCmdBeatmap.info("Try to send beatmap request via osu! IRC connection");
      await tryToSendOsuIrcMessage(
        data.osuIrcBot,
        "commandBeatmap",
        data.osuIrcRequestTarget,
        messageRequestIrc,
        logger
      );
    }
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.PERMIT_REQUEST)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandPermitRequest);
    if (!match) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.REQUESTS,
  },
};
