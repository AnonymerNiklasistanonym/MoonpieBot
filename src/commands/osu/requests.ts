// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  macroOsuBeatmapRequestDemands,
  macroOsuBeatmapRequests,
} from "../../info/macros/osuBeatmapRequest";
import {
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestCurrentlyOn,
  osuBeatmapRequestDemandsUpdated,
  osuBeatmapRequestTurnedOff,
  osuBeatmapRequestTurnedOn,
} from "../../info/strings/osu/beatmapRequest";
import {
  regexOsuChatHandlerCommandRequests,
  regexOsuChatHandlerCommandRequestsSet,
  regexOsuChatHandlerCommandRequestsUnset,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../twitchBadge";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { OsuRequestsConfig } from "../../info/databases/osuRequestsDb";
import osuRequestsDb from "../../database/osuRequestsDb";
import { TwitchBadgeLevel } from "../../twitch";
// Type imports
import type {
  BeatmapRequestsInfo,
  CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandOsuGenericDataOsuApiDbPath,
} from "../osu";
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler";
import type {
  RegexOsuChatHandlerCommandRequests,
  RegexOsuChatHandlerCommandRequestsSet,
  RegexOsuChatHandlerCommandRequestsUnset,
} from "../../info/regex";

export enum BeatmapRequestsType {
  INFO = "INFO",
  TURN_OFF = "TURN_OFF",
  TURN_ON = "TURN_ON",
}
export interface CommandBeatmapRequestsDetectorOutput {
  beatmapRequestsOnOffMessage?: string;
  beatmapRequestsType: BeatmapRequestsType;
}
/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 */
export const commandBeatmapRequests: ChatMessageHandlerReplyCreator<
  CommandOsuGenericDataOsuApiDbPath &
    CommandOsuGenericDataExtraBeatmapRequestsInfo,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandBeatmapRequestsDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
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
            option: OsuRequestsConfig.MESSAGE_OFF,
          },
          logger
        );
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          data.osuApiDbPath,
          {
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
            logger
          );
        if (
          osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.MESSAGE_OFF
          ) === undefined
        ) {
          return {
            additionalMacros: new Map([
              ...macros,
              ...generateMacroMapFromMacroGenerator(macroOsuBeatmapRequests, {
                customMessage: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.MESSAGE_ON
                )?.optionValue,
              }),
              ...generateMacroMapFromMacroGenerator(
                macroOsuBeatmapRequestDemands,
                {
                  osuRequestsConfigEntries,
                }
              ),
            ]),
            messageId: osuBeatmapRequestCurrentlyOn.id,
          };
        } else {
          return {
            additionalMacros: new Map([
              ...macros,
              ...generateMacroMapFromMacroGenerator(macroOsuBeatmapRequests, {
                customMessage: osuRequestsConfigEntries.find(
                  (a) => a.option === OsuRequestsConfig.MESSAGE_OFF
                )?.optionValue,
              }),
            ]),
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
    case OsuRequestsConfig.LENGTH_IN_MIN_MAX:
    case OsuRequestsConfig.LENGTH_IN_MIN_MIN:
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
    case OsuRequestsConfig.REDEEM_ID:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      return optionValue;

    case OsuRequestsConfig.DETAILED:
      if (optionValue === undefined) {
        throw Error("Boolean value was undefined!");
      }
      if (
        optionValue.toLowerCase() !== "true" &&
        optionValue.toLowerCase() !== "false"
      ) {
        throw Error(`Boolean value was not true/false (${optionValue})!`);
      }
      return optionValue.toLowerCase();
  }
};

export interface CommandBeatmapRequestsSetUnsetCreateReplyInputExtra
  extends CommandOsuGenericDataOsuApiDbPath {
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

export const commandBeatmapRequestsSetUnset: ChatMessageHandlerReplyCreator<
  CommandBeatmapRequestsSetUnsetCreateReplyInputExtra,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandBeatmapRequestsSetUnsetDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

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
            option,
          },
          logger
        );
    }

    const osuRequestsConfigEntries =
      await osuRequestsDb.requests.osuRequestsConfig.getEntries(
        data.osuApiDbPath,
        logger
      );

    return {
      additionalMacros: new Map([
        ...generateMacroMapFromMacroGenerator(macroOsuBeatmapRequests, {
          customMessage: osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.MESSAGE_ON
          )?.optionValue,
        }),
        ...generateMacroMapFromMacroGenerator(macroOsuBeatmapRequestDemands, {
          osuRequestsConfigEntries,
        }),
      ]),
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
