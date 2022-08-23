// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  MacroOsuBeatmapRequests,
  macroOsuBeatmapRequests,
} from "../../messageParser/macros/osuBeatmapRequest";
import {
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestCurrentlyOn,
  osuBeatmapRequestPermissionError,
  osuBeatmapRequestTurnedOff,
  osuBeatmapRequestTurnedOn,
} from "../../strings/osu/beatmapRequest";
import {
  parseTwitchBadgeLevel,
  TwitchBadgeLevels,
} from "../../other/twitchBadgeParser";
import { BeatmapRequestsInfo } from "../osu";
import { messageParserById } from "../../messageParser";
import { regexOsuChatHandlerCommandRequests } from "../../info/regex";
// Type imports
import type { EMPTY_OBJECT } from "../../info/other";
import type { RegexOsuChatHandlerCommandRequests } from "../../info/regex";
import type { TwitchChatCommandHandler } from "../../twitch";

export type CommandBeatmapRequestsCreateReplyInput = EMPTY_OBJECT;
export interface CommandBeatmapRequestsCreateReplyInputExtra
  extends CommandBeatmapRequestsCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
export enum BeatmapRequestsType {
  INFO = "INFO",
  TURN_OFF = "TURN_OFF",
  TURN_ON = "TURN_ON",
}
export interface CommandBeatmapRequestsDetectorOutput {
  beatmapRequestsOffMessage?: string;
  beatmapRequestsType: BeatmapRequestsType;
}
export interface CommandBeatmapRequestsDetectorInput {
  enabledCommands: string[];
}
/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 */
export const commandBeatmapRequests: TwitchChatCommandHandler<
  CommandBeatmapRequestsCreateReplyInputExtra,
  CommandBeatmapRequestsDetectorInput,
  CommandBeatmapRequestsDetectorOutput
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
    const twitchBadgeLevel = parseTwitchBadgeLevel(tags);
    if (
      (data.beatmapRequestsType === BeatmapRequestsType.TURN_OFF ||
        data.beatmapRequestsType === BeatmapRequestsType.TURN_ON) &&
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

    let message: string;
    const macros = new Map(globalMacros);

    switch (data.beatmapRequestsType) {
      case BeatmapRequestsType.TURN_OFF:
        data.beatmapRequestsInfo.beatmapRequestsOn = false;
        data.beatmapRequestsInfo.beatmapRequestsOffMessage =
          data.beatmapRequestsOffMessage;
        macros.set(
          macroOsuBeatmapRequests.id,
          new Map([
            [
              MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
              data.beatmapRequestsOffMessage
                ? data.beatmapRequestsOffMessage
                : "",
            ],
          ])
        );
        message = await messageParserById(
          osuBeatmapRequestTurnedOff.id,
          globalStrings,
          globalPlugins,
          macros,
          logger
        );
        break;
      case BeatmapRequestsType.TURN_ON:
        data.beatmapRequestsInfo.beatmapRequestsOn = true;
        message = await messageParserById(
          osuBeatmapRequestTurnedOn.id,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger
        );
        break;
      case BeatmapRequestsType.INFO:
        if (data.beatmapRequestsInfo.beatmapRequestsOn) {
          message = await messageParserById(
            osuBeatmapRequestCurrentlyOn.id,
            globalStrings,
            globalPlugins,
            globalMacros,
            logger
          );
        } else {
          // TODO Fix message not being displayed
          macros.set(
            macroOsuBeatmapRequests.id,
            new Map([
              [
                MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
                data.beatmapRequestsInfo.beatmapRequestsOffMessage
                  ? data.beatmapRequestsInfo.beatmapRequestsOffMessage
                  : "",
              ],
            ])
          );
          message = await messageParserById(
            osuBeatmapRequestCurrentlyOff.id,
            globalStrings,
            globalPlugins,
            macros,
            logger
          );
        }
        break;
    }

    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.REQUESTS)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandRequests);
    if (!match) {
      return false;
    }
    const matchGroups: undefined | RegexOsuChatHandlerCommandRequests =
      match.groups;
    if (!matchGroups) {
      throw Error("RegexOsuChatHandlerCommandRequests groups undefined");
    }
    if (matchGroups.requestsOn !== undefined) {
      return {
        data: {
          beatmapRequestsType: BeatmapRequestsType.TURN_ON,
        },
      };
    }
    if (matchGroups.requestsOff !== undefined) {
      return {
        data: {
          beatmapRequestsOffMessage: matchGroups.requestsOffMessage,
          beatmapRequestsType: BeatmapRequestsType.TURN_OFF,
        },
      };
    }
    return {
      data: {
        beatmapRequestsType: BeatmapRequestsType.INFO,
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.REQUESTS,
  },
};
