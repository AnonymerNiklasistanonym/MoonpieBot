// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  macroOsuBeatmapRequestDemands,
  macroOsuBeatmapRequests,
} from "../../messageParser/macros/osuBeatmapRequest";
import {
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestCurrentlyOn,
  osuBeatmapRequestDemandsUpdated,
  osuBeatmapRequestTurnedOff,
  osuBeatmapRequestTurnedOn,
} from "../../strings/osu/beatmapRequest";
import {
  regexOsuChatHandlerCommandRequests,
  RegexOsuChatHandlerCommandRequestsSet,
  regexOsuChatHandlerCommandRequestsSet,
  RegexOsuChatHandlerCommandRequestsUnset,
  regexOsuChatHandlerCommandRequestsUnset,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../../twitch";
import { errorMessageOsuApiDbPathUndefined } from "../../error";
import { OsuRequestsConfig } from "../../database/osuRequestsDb/requests/osuRequestsConfig";
import osuRequestsDb from "../../database/osuRequestsDb";
import { TwitchBadgeLevel } from "../../other/twitchBadgeParser";
// Type imports
import type {
  BeatmapRequestsInfo,
  CommandGenericDataOsuApiDbPath,
} from "../osu";
import type { RegexOsuChatHandlerCommandRequests } from "../../info/regex";
import type { TwitchChatCommandHandler } from "../../twitch";

export type CommandBeatmapRequestsCreateReplyInput =
  CommandGenericDataOsuApiDbPath;
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
  beatmapRequestsOnOffMessage?: string;
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
  createReply: async (channel, tags, data, logger) => {
    if (data.osuApiDbPath === undefined) {
      throw errorMessageOsuApiDbPathUndefined();
    }
    if (
      data.beatmapRequestsType === BeatmapRequestsType.TURN_OFF ||
      data.beatmapRequestsType === BeatmapRequestsType.TURN_ON
    ) {
      const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
        tags,
        TwitchBadgeLevel.MODERATOR
      );
      if (twitchBadgeLevelCheck !== undefined) {
        return twitchBadgeLevelCheck;
      }
    }

    const macros = new Map();

    switch (data.beatmapRequestsType) {
      case BeatmapRequestsType.TURN_OFF:
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          data.osuApiDbPath,
          {
            channel,
            option: OsuRequestsConfig.MESSAGE_OFF,
            optionValue:
              data.beatmapRequestsOnOffMessage !== undefined
                ? data.beatmapRequestsOnOffMessage
                : "",
          },
          logger
        );
        macros.set(
          macroOsuBeatmapRequests.id,
          new Map(
            macroOsuBeatmapRequests.generate({
              customMessage: data.beatmapRequestsOnOffMessage,
            })
          )
        );
        return {
          additionalMacros: macros,
          messageId: osuBeatmapRequestTurnedOff.id,
        };
      case BeatmapRequestsType.TURN_ON:
        await osuRequestsDb.requests.osuRequestsConfig.removeEntry(
          data.osuApiDbPath,
          {
            channel,
            option: OsuRequestsConfig.MESSAGE_OFF,
          },
          logger
        );
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          data.osuApiDbPath,
          {
            channel,
            option: OsuRequestsConfig.MESSAGE_ON,
            optionValue:
              data.beatmapRequestsOnOffMessage !== undefined
                ? data.beatmapRequestsOnOffMessage
                : "",
          },
          logger
        );
        macros.set(
          macroOsuBeatmapRequests.id,
          new Map(
            macroOsuBeatmapRequests.generate({
              customMessage: data.beatmapRequestsOnOffMessage,
            })
          )
        );
        return {
          additionalMacros: macros,
          messageId: osuBeatmapRequestTurnedOn.id,
        };
      case BeatmapRequestsType.INFO:
        // eslint-disable-next-line no-case-declarations
        const osuRequestsConfigEntries =
          await osuRequestsDb.requests.osuRequestsConfig.getEntries(
            data.osuApiDbPath,
            channel,
            logger
          );
        if (
          osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.MESSAGE_OFF
          ) === undefined
        ) {
          macros.set(
            macroOsuBeatmapRequests.id,
            new Map(
              macroOsuBeatmapRequests.generate({
                customMessage: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.MESSAGE_ON
                )?.optionValue,
              })
            )
          );

          macros.set(
            macroOsuBeatmapRequestDemands.id,
            new Map(
              macroOsuBeatmapRequestDemands.generate({
                arRangeMax: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.AR_MAX
                )?.optionValue,
                arRangeMin: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.AR_MIN
                )?.optionValue,
                csRangeMax: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.CS_MAX
                )?.optionValue,
                csRangeMin: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.CS_MIN
                )?.optionValue,
                starRangeMax: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.STAR_MAX
                )?.optionValue,
                starRangeMin: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.STAR_MIN
                )?.optionValue,
              })
            )
          );
          return {
            additionalMacros: macros,
            messageId: osuBeatmapRequestCurrentlyOn.id,
          };
        } else {
          macros.set(
            macroOsuBeatmapRequests.id,
            new Map(
              macroOsuBeatmapRequests.generate({
                customMessage: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.MESSAGE_OFF
                )?.optionValue,
              })
            )
          );
          return {
            additionalMacros: macros,
            messageId: osuBeatmapRequestCurrentlyOff.id,
          };
        }
    }
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.REQUESTS)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandRequests);
    if (!match) {
      return false;
    }
    // If regex also matches osu requests set/unset ignore
    if (
      message.match(regexOsuChatHandlerCommandRequestsSet) ||
      message.match(regexOsuChatHandlerCommandRequestsUnset)
    ) {
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
          beatmapRequestsOnOffMessage: matchGroups.requestsOnOffMessage,
          beatmapRequestsType: BeatmapRequestsType.TURN_ON,
        },
      };
    }
    if (matchGroups.requestsOff !== undefined) {
      return {
        data: {
          beatmapRequestsOnOffMessage: matchGroups.requestsOnOffMessage,
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

const validateSetValue = (
  option: OsuRequestsConfig,
  optionValue?: string
): string => {
  switch (option) {
    case OsuRequestsConfig.AR_MAX:
    case OsuRequestsConfig.AR_MIN:
    case OsuRequestsConfig.CS_MAX:
    case OsuRequestsConfig.CS_MIN:
    case OsuRequestsConfig.STAR_MAX:
    case OsuRequestsConfig.STAR_MIN:
      if (optionValue === undefined) {
        throw Error("Number value was undefined!");
      }
      // eslint-disable-next-line no-case-declarations
      const floatValue = parseFloat(optionValue);
      if (isNaN(floatValue)) {
        throw Error("Number value was NaN!");
      }
      if (!isFinite(floatValue)) {
        throw Error("Number value was not finite!");
      }
      return optionValue;

    case OsuRequestsConfig.MESSAGE_OFF:
    case OsuRequestsConfig.MESSAGE_ON:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      return optionValue;
  }
};

export type CommandBeatmapRequestsSetUnsetCreateReplyInput =
  CommandGenericDataOsuApiDbPath;
export interface CommandBeatmapRequestsSetUnsetCreateReplyInputExtra
  extends CommandBeatmapRequestsSetUnsetCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
export enum BeatmapRequestsSetUnsetType {
  SET = "SET",
  UNSET = "UNSET",
}
export interface CommandBeatmapRequestsSetUnsetDetectorOutput {
  beatmapRequestsSetOption: string;
  beatmapRequestsSetOptionValue?: string;
  beatmapRequestsSetType: BeatmapRequestsSetUnsetType;
}
export interface CommandBeatmapRequestsSetUnsetDetectorInput {
  enabledCommands: string[];
}

export const commandBeatmapRequestsSetUnset: TwitchChatCommandHandler<
  CommandBeatmapRequestsSetUnsetCreateReplyInputExtra,
  CommandBeatmapRequestsSetUnsetDetectorInput,
  CommandBeatmapRequestsSetUnsetDetectorOutput
> = {
  createReply: async (channel, tags, data, logger) => {
    if (data.osuApiDbPath === undefined) {
      throw errorMessageOsuApiDbPathUndefined();
    }
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    const macros = new Map();

    let option: undefined | OsuRequestsConfig;
    for (const value of Object.values(OsuRequestsConfig)) {
      if (value.toLowerCase() === data.beatmapRequestsSetOption.toLowerCase()) {
        option = value;
      }
    }

    if (option === undefined) {
      throw Error(
        `Unknown set/unset option '${
          data.beatmapRequestsSetOption
        }' (supported: ${Object.values(OsuRequestsConfig).join(",")})`
      );
    }

    switch (data.beatmapRequestsSetType) {
      case BeatmapRequestsSetUnsetType.SET:
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          data.osuApiDbPath,
          {
            channel,
            option,
            optionValue: validateSetValue(
              option,
              data.beatmapRequestsSetOptionValue
            ),
          },
          logger
        );
        break;
      case BeatmapRequestsSetUnsetType.UNSET:
        await osuRequestsDb.requests.osuRequestsConfig.removeEntry(
          data.osuApiDbPath,
          {
            channel,
            option,
          },
          logger
        );
    }

    const osuRequestsConfigEntries =
      await osuRequestsDb.requests.osuRequestsConfig.getEntries(
        data.osuApiDbPath,
        channel,
        logger
      );

    macros.set(
      macroOsuBeatmapRequests.id,
      new Map(
        macroOsuBeatmapRequests.generate({
          customMessage: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.MESSAGE_ON
          )?.optionValue,
        })
      )
    );

    macros.set(
      macroOsuBeatmapRequestDemands.id,
      new Map(
        macroOsuBeatmapRequestDemands.generate({
          arRangeMax: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.AR_MAX
          )?.optionValue,
          arRangeMin: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.AR_MIN
          )?.optionValue,
          csRangeMax: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.CS_MAX
          )?.optionValue,
          csRangeMin: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.CS_MIN
          )?.optionValue,
          starRangeMax: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.STAR_MAX
          )?.optionValue,
          starRangeMin: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.STAR_MIN
          )?.optionValue,
        })
      )
    );

    return {
      additionalMacros: macros,
      messageId: osuBeatmapRequestDemandsUpdated.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.REQUESTS)) {
      return false;
    }
    const matchSet = message.match(regexOsuChatHandlerCommandRequestsSet);
    const matchUnset = message.match(regexOsuChatHandlerCommandRequestsUnset);
    if (matchSet) {
      const matchGroups = matchSet.groups as
        | undefined
        | RegexOsuChatHandlerCommandRequestsSet;
      if (!matchGroups) {
        throw Error("RegexOsuChatHandlerCommandRequestsSet groups undefined");
      }
      return {
        data: {
          beatmapRequestsSetOption: matchGroups.setOption,
          beatmapRequestsSetOptionValue: matchGroups.setOptionValue,
          beatmapRequestsSetType: BeatmapRequestsSetUnsetType.SET,
        },
      };
    }
    if (matchUnset) {
      const matchGroups = matchUnset.groups as
        | undefined
        | RegexOsuChatHandlerCommandRequestsUnset;
      if (!matchGroups) {
        throw Error("RegexOsuChatHandlerCommandRequestsUnset groups undefined");
      }
      return {
        data: {
          beatmapRequestsSetOption: matchGroups.unsetOption,
          beatmapRequestsSetType: BeatmapRequestsSetUnsetType.UNSET,
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
