// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  errorMessageOsuApiCredentialsUndefined,
  errorMessageOsuApiDbPathUndefined,
} from "../../error";
import {
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequestDemands,
  macroOsuBeatmapRequests,
} from "../../messageParser/macros/osuBeatmapRequest";
import { NOT_FOUND_STATUS_CODE, notUndefined } from "../../info/other";
import {
  osuBeatmapRequest,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNoRedeem,
  osuBeatmapRequestNotFound,
  osuBeatmapRequestNotMeetingDemands,
} from "../../strings/osu/beatmapRequest";
import {
  regexOsuBeatmapIdFromUrl,
  regexOsuBeatmapUrlSplitter,
} from "../../info/regex";
import { createLogFunc } from "../../logging";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { generatePlugin } from "../../messageParser/plugins";
import { LOG_ID_CHAT_HANDLER_OSU } from "../../info/commands";
import { macroOsuBeatmap } from "../../messageParser/macros/osuApi";
import { OsuRequestsConfig } from "../../database/osuRequestsDb/requests/osuRequestsConfig";
import osuRequestsDb from "../../database/osuRequestsDb";
import { pluginsTwitchChatGenerator } from "../../messageParser/plugins/twitchChat";
import { tryToSendOsuIrcMessage } from "../../osuIrc";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerReply,
} from "../../twitch";
import type {
  CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandOsuGenericDataOsuApiDbPath,
  CommandOsuGenericDataOsuApiV2Credentials,
  CommandOsuGenericDataOsuIrcData,
} from "../osu";
import type { MacroMap, PluginMap } from "../../messageParser";
import type { Beatmap } from "osu-api-v2";
import type { GetOsuRequestsConfigOut } from "../../database/osuRequestsDb/requests/osuRequestsConfig";
import type { Client as IrcClient } from "irc";
import type { OsuApiV2WebRequestError } from "osu-api-v2";
import type { PluginTwitchChatData } from "../../messageParser/plugins/twitchChat";
import type { RegexOsuBeatmapIdFromUrl } from "../../info/regex";

const MAX_LENGTH_PREVIOUS_REQUESTS = 15;

export type OsuIrcBotSendMessageFunc = (logId: string) => IrcClient;
export interface BeatmapRequest {
  beatmapId: number;
  comment?: string;
}

const checkIfBeatmapMatchesDemands = (
  beatmap: Beatmap,
  demands: GetOsuRequestsConfigOut[]
) => {
  for (const demand of demands) {
    switch (demand.option) {
      case OsuRequestsConfig.AR_MAX:
        if (beatmap.ar > parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      case OsuRequestsConfig.AR_MIN:
        if (beatmap.ar < parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      case OsuRequestsConfig.CS_MAX:
        if (beatmap.cs > parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      case OsuRequestsConfig.CS_MIN:
        if (beatmap.cs < parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      case OsuRequestsConfig.STAR_MAX:
        if (beatmap.difficulty_rating > parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      case OsuRequestsConfig.STAR_MIN:
        if (beatmap.difficulty_rating < parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      default:
        // Ignore unknown options or messages
        break;
    }
  }
  return true;
};

export const sendBeatmapRequest = (
  detailedMapRequests: boolean | undefined,
  messageParserMacros: MacroMap = new Map(),
  messageParserTwitchPluginData: PluginTwitchChatData | undefined,
  beatmapRequestId: number,
  beatmapRequestComment?: string,
  beatmap?: Beatmap,
  osuIrcRequestTarget?: string,
  osuIrcBot?: OsuIrcBotSendMessageFunc
): TwitchChatCommandHandlerReply[] => {
  const commandRepliesBeatmap: TwitchChatCommandHandlerReply[] = [];
  let twitchPluginOverride: PluginMap | undefined;
  if (messageParserTwitchPluginData) {
    // Overwrite the user name and id for the correct requestor name
    twitchPluginOverride = new Map();
    pluginsTwitchChatGenerator.forEach((a) => {
      const plugin = generatePlugin<PluginTwitchChatData>(
        a,
        messageParserTwitchPluginData
      );
      twitchPluginOverride?.set(plugin.id, plugin.func);
    });
  }
  messageParserMacros.set(
    macroOsuBeatmapRequest.id,
    new Map(
      macroOsuBeatmapRequest.generate({
        comment: beatmapRequestComment?.trim(),
        id: beatmapRequestId,
      })
    )
  );
  if (beatmap !== undefined) {
    messageParserMacros.set(
      macroOsuBeatmap.id,
      new Map(macroOsuBeatmap.generate({ beatmap }))
    );
  }
  commandRepliesBeatmap.push({
    additionalMacros: messageParserMacros,
    messageId: detailedMapRequests
      ? osuBeatmapRequestDetailed.id
      : osuBeatmapRequest.id,
  });
  if (osuIrcRequestTarget && osuIrcBot !== undefined) {
    commandRepliesBeatmap.push({
      additionalMacros: messageParserMacros,
      additionalPlugins: twitchPluginOverride,
      customSendFunc: async (message, loggerSendFunc) => {
        await tryToSendOsuIrcMessage(
          osuIrcBot,
          "commandBeatmap",
          osuIrcRequestTarget,
          message,
          loggerSendFunc
        );
        return [osuIrcRequestTarget, message];
      },
      messageId: detailedMapRequests
        ? osuBeatmapRequestIrcDetailed.id
        : osuBeatmapRequestIrc.id,
    });
  }
  return commandRepliesBeatmap;
};

export interface CommandBeatmapCreateReplyInput
  extends CommandOsuGenericDataOsuApiDbPath,
    CommandOsuGenericDataOsuApiV2Credentials,
    CommandOsuGenericDataOsuIrcData {
  /**
   * The default osu user ID.
   */
  defaultOsuId?: number;
  enableOsuBeatmapRequests?: boolean;
  enableOsuBeatmapRequestsDetailed?: boolean;
  /**
   * If string not empty/undefined check if the beatmap request was redeemed or
   * just a normal chat message.
   */
  enableOsuBeatmapRequestsRedeemId?: string;
}
export interface CommandBeatmapDetectorOutput {
  /**
   * The found beatmap requests.
   */
  beatmapRequests: BeatmapRequest[];
}
export interface CommandBeatmapDetectorInput
  extends CommandGenericDetectorInputEnabledCommands {
  enableOsuBeatmapRequests?: boolean;
}
/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 */
export const commandBeatmap: TwitchChatCommandHandler<
  CommandBeatmapCreateReplyInput &
    CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandBeatmapDetectorInput,
  CommandBeatmapDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    if (data.osuApiV2Credentials === undefined) {
      throw errorMessageOsuApiCredentialsUndefined();
    }
    if (data.osuApiDbPath === undefined) {
      throw errorMessageOsuApiDbPathUndefined();
    }

    const logCmdBeatmap = createLogFunc(
      logger,
      LOG_ID_CHAT_HANDLER_OSU,
      "beatmap"
    );

    if (
      data.enableOsuBeatmapRequestsRedeemId !== undefined &&
      tags["custom-reward-id"] !== data.enableOsuBeatmapRequestsRedeemId
    ) {
      logger.info(
        `For the beatmap request the redeem ID "${
          data.enableOsuBeatmapRequestsRedeemId
        }" was expected but found was ${
          tags["custom-reward-id"]
            ? `"${tags["custom-reward-id"] as string}"`
            : "no id"
        }`
      );
      return {
        messageId: osuBeatmapRequestNoRedeem.id,
      };
    }

    const osuRequestsConfigEntries =
      await osuRequestsDb.requests.osuRequestsConfig.getEntries(
        data.osuApiDbPath,
        logger
      );

    if (
      osuRequestsConfigEntries.find(
        (a) => a.option === OsuRequestsConfig.MESSAGE_OFF
      ) !== undefined
    ) {
      // TODO Allow beatmap to be sent via the !osupermitrequest command
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroOsuBeatmapRequests,
          {
            customMessage: osuRequestsConfigEntries.find(
              (a) => a.option === OsuRequestsConfig.MESSAGE_OFF
            )?.optionValue,
          }
        ),
        messageId: osuBeatmapRequestCurrentlyOff.id,
      };
    }

    const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
      data.osuApiV2Credentials.clientId,
      data.osuApiV2Credentials.clientSecret
    );

    const commandReplies: TwitchChatCommandHandlerReply[] = [];

    for (const beatmapRequest of data.beatmapRequests) {
      const osuBeatmapRequestMacros: MacroMap = new Map();
      osuBeatmapRequestMacros.set(
        macroOsuBeatmapRequest.id,
        new Map(
          macroOsuBeatmapRequest.generate({
            comment: beatmapRequest.comment?.trim(),
            id: beatmapRequest.beatmapId,
          })
        )
      );

      // Get beatmap and if found the current top score and convert them into a
      // message for Twitch and IRC channel
      let beatmap: Beatmap | undefined;
      try {
        beatmap = await osuApiV2.beatmaps.get(
          oauthAccessToken,
          beatmapRequest.beatmapId
        );
        if (beatmap) {
          if (
            !checkIfBeatmapMatchesDemands(beatmap, osuRequestsConfigEntries)
          ) {
            data.beatmapRequestsInfo.blockedBeatmapRequest = {
              comment: beatmapRequest.comment?.trim(),
              data: beatmap,
              userId: tags["user-id"],
              userName: tags.username,
            };
            osuBeatmapRequestMacros.set(
              macroOsuBeatmapRequests.id,
              new Map(
                macroOsuBeatmapRequests.generate({
                  customMessage: osuRequestsConfigEntries.find(
                    (a) => a.option === OsuRequestsConfig.MESSAGE_ON
                  )?.optionValue,
                })
              )
            );
            osuBeatmapRequestMacros.set(
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
              additionalMacros: osuBeatmapRequestMacros,
              isError: true,
              messageId: osuBeatmapRequestNotMeetingDemands.id,
            };
          }

          data.beatmapRequestsInfo.lastMentionedBeatmapId = beatmap.id;
          data.beatmapRequestsInfo.previousBeatmapRequests.unshift({
            comment: beatmapRequest.comment?.trim(),
            data: beatmap,
            userId: tags["user-id"],
            userName: tags.username,
          });
          // Truncate array at a max length
          data.beatmapRequestsInfo.previousBeatmapRequests =
            data.beatmapRequestsInfo.previousBeatmapRequests.slice(
              0,
              MAX_LENGTH_PREVIOUS_REQUESTS
            );
        }
        // Check for user score
      } catch (err) {
        if (
          (err as OsuApiV2WebRequestError).statusCode === NOT_FOUND_STATUS_CODE
        ) {
          logCmdBeatmap.warn((err as OsuApiV2WebRequestError).message);
          return {
            additionalMacros: osuBeatmapRequestMacros,
            isError: true,
            messageId: osuBeatmapRequestNotFound.id,
          };
        } else {
          throw err;
        }
      }

      commandReplies.push(
        ...sendBeatmapRequest(
          data.enableOsuBeatmapRequestsDetailed,
          osuBeatmapRequestMacros,
          undefined,
          beatmapRequest.beatmapId,
          beatmapRequest.comment,
          beatmap,
          data.osuIrcRequestTarget,
          data.osuIrcBot
        )
      );
    }
    return commandReplies;
  },
  detect: (_tags, message, data) => {
    if (!data.enableOsuBeatmapRequests) {
      return false;
    }
    if (!message.match(regexOsuBeatmapIdFromUrl)) {
      return false;
    }
    if (message.trimStart().startsWith("@")) {
      // Ignore map replies
      return false;
    }
    const beatmapRequests: BeatmapRequest[] = regexOsuBeatmapUrlSplitter(
      message
    )
      .map((a) => {
        const match = a.match(regexOsuBeatmapIdFromUrl);
        if (!match) {
          return;
        }
        const matchGroups = match.groups as
          | undefined
          | RegexOsuBeatmapIdFromUrl;
        if (!matchGroups) {
          throw Error("RegexOsuBeatmapIdFromUrl groups undefined");
        }
        let beatmapId;
        if ("beatmapIdB" in matchGroups) {
          beatmapId = matchGroups.beatmapIdB;
        } else if ("beatmapIdBeatmaps" in matchGroups) {
          beatmapId = matchGroups.beatmapIdBeatmaps;
        } else if ("beatmapIdBeatmapsets" in matchGroups) {
          beatmapId = matchGroups.beatmapIdBeatmapsets;
        }
        if (beatmapId !== undefined) {
          return {
            beatmapId: parseInt(beatmapId),
            comment: matchGroups.comment,
          };
        }
      })
      .filter(notUndefined);
    if (beatmapRequests.length === 0) {
      return false;
    }
    return { data: { beatmapRequests } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: "beatmap",
  },
};
