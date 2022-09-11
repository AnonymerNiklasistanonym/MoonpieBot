// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuBeatmapRequest,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNoRequestsError,
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
import { regexOsuChatHandlerCommandLastRequest } from "../../info/regex";
import { tryToSendOsuIrcMessage } from "../../osuIrc";
// Type imports
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerReply,
} from "../../twitch";
import type { EMPTY_OBJECT } from "../../info/other";
import type { OsuIrcBotSendMessageFunc } from "./beatmap";
import type { PluginTwitchChatData } from "../../messageParser/plugins/twitchChat";
import type { RegexOsuChatHandlerCommandLastRequest } from "../../info/regex";

export type CommandBeatmapLastRequestCreateReplyInput = EMPTY_OBJECT;
export interface CommandBeatmapLastRequestCreateReplyInputExtra
  extends CommandBeatmapLastRequestCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
  enableOsuBeatmapRequestsDetailed?: boolean;
  osuIrcBot?: OsuIrcBotSendMessageFunc;
  osuIrcRequestTarget?: string;
}
export interface CommandBeatmapLastRequestDetectorOutput {
  beatmapRequestCount: number;
}
export interface CommandBeatmapLastRequestDetectorInput {
  enabledCommands: string[];
}
/**
 * Post information about the last beatmap request in chat and resend them
 * if enabled via IRC to the client.
 */
export const commandBeatmapLastRequest: TwitchChatCommandHandler<
  CommandBeatmapLastRequestCreateReplyInputExtra,
  CommandBeatmapLastRequestDetectorInput,
  CommandBeatmapLastRequestDetectorOutput
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
      "beatmapLastRequest"
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

    if (data.beatmapRequestCount < 1) {
      data.beatmapRequestCount = 1;
    }

    if (data.beatmapRequestsInfo.previousBeatmapRequests.length < 1) {
      const errorMessage = await messageParserById(
        osuBeatmapRequestNoRequestsError.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      throw Error(errorMessage);
    }

    const commandReplies: TwitchChatCommandHandlerReply[] = [];
    const previousBeatmapRequests =
      data.beatmapRequestsInfo.previousBeatmapRequests
        .slice(0, data.beatmapRequestCount)
        .reverse();

    for (const previousBeatmapRequest of previousBeatmapRequests) {
      const osuBeatmapRequestMacros = new Map(globalMacros);
      osuBeatmapRequestMacros.set(
        macroOsuBeatmapRequest.id,
        new Map(
          macroOsuBeatmapRequest.generate({
            comment: previousBeatmapRequest.comment?.trim(),
            id: previousBeatmapRequest.id,
          })
        )
      );
      osuBeatmapRequestMacros.set(
        macroOsuBeatmap.id,
        new Map(
          macroOsuBeatmap.generate({ beatmap: previousBeatmapRequest.data })
        )
      );

      const osuBeatmapRequestPlugins = new Map(globalPlugins);
      pluginsTwitchChatGenerator.forEach((a) => {
        const plugin = generatePlugin<PluginTwitchChatData>(a, {
          channelName: channel.slice(1),
          userId: previousBeatmapRequest.userId,
          userName: previousBeatmapRequest.userName,
        });
        osuBeatmapRequestPlugins.set(plugin.id, plugin.func);
      });

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
        logCmdBeatmap.info(
          "Try to send beatmap request via osu! IRC connection"
        );
        await tryToSendOsuIrcMessage(
          data.osuIrcBot,
          "commandBeatmap",
          data.osuIrcRequestTarget,
          messageRequestIrc,
          logger
        );
      }
      commandReplies.push({ sentMessage });
    }
    return commandReplies;
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.LAST_REQUEST)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandLastRequest);
    if (!match) {
      return false;
    }
    const matchGroups: undefined | RegexOsuChatHandlerCommandLastRequest =
      match.groups;
    if (!matchGroups) {
      throw Error("RegexOsuChatHandlerCommandLastRequest groups undefined");
    }
    if (matchGroups.lastRequestCount !== undefined) {
      return {
        data: {
          beatmapRequestCount: parseInt(matchGroups.lastRequestCount),
        },
      };
    }
    return { data: { beatmapRequestCount: 1 } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.REQUESTS,
  },
};
