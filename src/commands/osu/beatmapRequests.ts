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
import { errorMessageEnabledCommandsUndefined } from "../../error";
import { messageParserById } from "../../messageParser";
// Type imports
import type { TwitchChatCommandHandler } from "../../twitch";

/**
 * Regex to recognize the !osuRequests enable command.
 *
 * @example
 * ```text
 * !osuRequests on
 * ```
 */
export const regexEnableBeatmapRequests = /^\s*!osuRequests\s+on(?:\s|$)/i;

/**
 * Regex to recognize the !osuRequests disable command.
 *
 * @example
 * ```text
 * !osuRequests off $OPTIONAL_TEXT
 * ```
 */
export const regexDisableBeatmapRequests =
  /^\s*!osuRequests\s+off(?:\s+(.*?)\s*$|\s|$)/i;

/**
 * Regex to recognize the !osuRequests command.
 *
 * @example
 * ```text
 * !osuRequests $OPTIONAL_TEXT
 * ```
 */
export const regexBeatmapRequestsStatus =
  /^\s*!osuRequests(?:\s+(.*?)\s*$|\s|$)/i;

export interface CommandHandlerBeatmapRequestsData {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}

enum BeatmapRequestsType {
  INFO = "INFO",
  TURN_OFF = "TURN_OFF",
  TURN_ON = "TURN_ON",
}

export interface CommandDetectorBeatmapRequestsData {
  beatmapRequestsOffMessage?: string;
  beatmapRequestsType: BeatmapRequestsType;
}

/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 */
export const commandBeatmapRequests: TwitchChatCommandHandler<
  CommandHandlerBeatmapRequestsData,
  CommandDetectorBeatmapRequestsData
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
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!enabledCommands.includes(OsuCommands.REQUESTS)) {
      return false;
    }
    const matchEnable = message.match(regexEnableBeatmapRequests);
    if (matchEnable) {
      return {
        data: {
          beatmapRequestsType: BeatmapRequestsType.TURN_ON,
        },
      };
    }
    const matchDisable = message.match(regexDisableBeatmapRequests);
    if (matchDisable) {
      return {
        data: {
          beatmapRequestsOffMessage: matchDisable[1],
          beatmapRequestsType: BeatmapRequestsType.TURN_OFF,
        },
      };
    }
    const matchStatus = message.match(regexBeatmapRequestsStatus);
    if (matchStatus) {
      return {
        data: {
          beatmapRequestsType: BeatmapRequestsType.INFO,
        },
      };
    }
    return false;
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.REQUESTS,
  },
};
