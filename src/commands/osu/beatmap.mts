// Package imports
import osuApiV2 from "osu-api-v2";
// Relative imports
import {
  LOG_ID_CHAT_HANDLER_OSU,
  OsuCommands,
} from "../../info/chatCommands.mjs";
import {
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequestDemands,
  macroOsuBeatmapRequests,
} from "../../info/macros/osuBeatmapRequest.mjs";
import {
  osuBeatmapRequest,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNoRedeem,
  osuBeatmapRequestNotFound,
  osuBeatmapRequestNotMeetingDemands,
} from "../../info/strings/osu/beatmapRequest.mjs";
import {
  regexOsuBeatmapIdFromUrl,
  regexOsuBeatmapUrlSplitter,
} from "../../info/regex.mjs";
import { createLogFunc } from "../../logging.mjs";
import { generateMacroMapFromMacroGenerator } from "../../messageParser.mjs";
import { macroOsuBeatmap } from "../../info/macros/osuApi.mjs";
import { NOT_FOUND_STATUS_CODE } from "../../other/web.mjs";
import { notUndefined } from "../../other/types.mjs";
import { OsuRequestsConfig } from "../../info/databases/osuRequestsDb.mjs";
import osuRequestsDb from "../../database/osuRequestsDb.mjs";
import { tryToSendOsuIrcMessage } from "../../osuIrc.mjs";
// Type imports
import type { Beatmap, OsuApiV2WebRequestError } from "osu-api-v2";
import type {
  ChatMessageHandlerReply,
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type {
  CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandOsuGenericDataOsuApiDbPath,
  CommandOsuGenericDataOsuApiV2Credentials,
  CommandOsuGenericDataOsuIrcData,
} from "../osu.mjs";
import type { GetOsuRequestsConfigOut } from "../../database/osuRequestsDb/requests/osuRequestsConfig.mjs";
import type { Client as IrcClient } from "irc";
import type { Logger } from "winston";
import type { MacroMap } from "../../messageParser.mjs";
import type { RegexOsuBeatmapIdFromUrl } from "../../info/regex.mjs";

const MAX_LENGTH_PREVIOUS_REQUESTS = 15;

export type OsuIrcBotSendMessageFunc = (logId: string) => IrcClient;
export interface BeatmapRequest {
  beatmapId: number;
  comment?: string;
}

const checkIfBeatmapMatchesDemands = (
  beatmap: Beatmap,
  demands: GetOsuRequestsConfigOut[],
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
      case OsuRequestsConfig.LENGTH_IN_MIN_MAX:
        if (beatmap.total_length / 60.0 > parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      case OsuRequestsConfig.LENGTH_IN_MIN_MIN:
        if (beatmap.total_length / 60.0 < parseFloat(demand.optionValue)) {
          return false;
        }
        break;
      case OsuRequestsConfig.ENABLED:
      case OsuRequestsConfig.DETAILED:
      case OsuRequestsConfig.DETAILED_IRC:
      case OsuRequestsConfig.MESSAGE:
      case OsuRequestsConfig.REDEEM_ID:
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
    }
  }
  return true;
};

export const sendBeatmapRequest = (
  detailedMapRequests: boolean,
  detailedMapRequestsIrc: boolean,
  messageParserMacros: MacroMap = new Map(),
  beatmapRequestId: number,
  beatmapRequester: string,
  logger: Readonly<Logger>,
  beatmapRequestComment?: string,
  beatmap?: Beatmap,
  osuIrcRequestTarget?: string,
  osuIrcBot?: OsuIrcBotSendMessageFunc,
): ChatMessageHandlerReply[] => {
  const commandRepliesBeatmap: ChatMessageHandlerReply[] = [];
  messageParserMacros.set(
    macroOsuBeatmapRequest.id,
    new Map(
      macroOsuBeatmapRequest.generate(
        {
          comment: beatmapRequestComment?.trim(),
          id: beatmapRequestId,
          requester: beatmapRequester,
        },
        logger,
      ),
    ),
  );
  if (beatmap !== undefined) {
    messageParserMacros.set(
      macroOsuBeatmap.id,
      new Map(macroOsuBeatmap.generate({ beatmap }, logger)),
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
      customSendFunc: async (message, loggerSendFunc) => {
        await tryToSendOsuIrcMessage(
          osuIrcBot,
          "commandBeatmap",
          osuIrcRequestTarget,
          message,
          loggerSendFunc,
        );
        return [osuIrcRequestTarget, message];
      },
      messageId: detailedMapRequestsIrc
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
}
export interface CommandBeatmapDetectorOutput {
  /**
   * The found beatmap requests.
   */
  beatmapRequests: BeatmapRequest[];
}
/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 */
export const commandBeatmap: ChatMessageHandlerReplyCreator<
  CommandBeatmapCreateReplyInput &
    CommandOsuGenericDataExtraBeatmapRequestsInfo,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandBeatmapDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const logCmdBeatmap = createLogFunc(
      logger,
      LOG_ID_CHAT_HANDLER_OSU,
      "beatmap",
    );

    const osuRequestsConfigEntries =
      await osuRequestsDb.requests.osuRequestsConfig.getEntries(
        data.osuApiDbPath,
        logger,
      );

    const redeemId = osuRequestsConfigEntries.find(
      (a) => a.option === OsuRequestsConfig.REDEEM_ID,
    )?.optionValue;
    if (
      redeemId !== undefined &&
      redeemId.length > 0 &&
      tags["custom-reward-id"] !== redeemId
    ) {
      logger.info(
        `For the beatmap request the redeem ID "${redeemId}" was expected but found was ${
          tags["custom-reward-id"]
            ? `"${tags["custom-reward-id"] as string}"`
            : "no id"
        }`,
      );
      return {
        messageId: osuBeatmapRequestNoRedeem.id,
      };
    }

    if (
      osuRequestsConfigEntries.find(
        (a) => a.option === OsuRequestsConfig.ENABLED,
      )?.optionValue === "false"
    ) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroOsuBeatmapRequests,
          {
            customMessage: osuRequestsConfigEntries.find(
              (a) => a.option === OsuRequestsConfig.MESSAGE,
            )?.optionValue,
          },
          logger,
        ),
        messageId: osuBeatmapRequestCurrentlyOff.id,
      };
    }

    const oauthAccessToken =
      await osuApiV2.default.oauth.clientCredentialsGrant(
        data.osuApiV2Credentials.clientId,
        data.osuApiV2Credentials.clientSecret,
      );

    const commandReplies: ChatMessageHandlerReply[] = [];

    for (const beatmapRequest of data.beatmapRequests) {
      const osuBeatmapRequestMacros: MacroMap = new Map();
      osuBeatmapRequestMacros.set(
        macroOsuBeatmapRequest.id,
        new Map(
          macroOsuBeatmapRequest.generate(
            {
              comment: beatmapRequest.comment?.trim(),
              id: beatmapRequest.beatmapId,
              requester: tags.username,
            },
            logger,
          ),
        ),
      );

      // Get beatmap and if found the current top score and convert them into a
      // message for Twitch and IRC channel
      let beatmap: Beatmap | undefined;
      try {
        beatmap = await osuApiV2.default.beatmaps.get(
          oauthAccessToken,
          beatmapRequest.beatmapId,
        );
        if (!checkIfBeatmapMatchesDemands(beatmap, osuRequestsConfigEntries)) {
          data.beatmapRequestsInfo.blockedBeatmapRequest = {
            comment: beatmapRequest.comment?.trim(),
            data: beatmap,
            userId: tags["user-id"],
            userName: tags.username,
          };
          return {
            additionalMacros: new Map([
              ...osuBeatmapRequestMacros,
              ...generateMacroMapFromMacroGenerator(
                macroOsuBeatmapRequests,
                {
                  customMessage: osuRequestsConfigEntries.find(
                    (a) => a.option === OsuRequestsConfig.MESSAGE,
                  )?.optionValue,
                },
                logger,
              ),
              ...generateMacroMapFromMacroGenerator(
                macroOsuBeatmapRequestDemands,
                {
                  osuRequestsConfigEntries,
                },
                logger,
              ),
            ]),
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
            MAX_LENGTH_PREVIOUS_REQUESTS,
          );
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
          osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.DETAILED,
          )?.optionValue === "true",
          osuRequestsConfigEntries.find(
            (a) => a.option === OsuRequestsConfig.DETAILED_IRC,
          )?.optionValue === "true",
          osuBeatmapRequestMacros,
          beatmapRequest.beatmapId,
          tags.username,
          logger,
          beatmapRequest.comment,
          beatmap,
          data.osuIrcRequestTarget,
          data.osuIrcBot,
        ),
      );
    }
    return commandReplies;
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.REQUESTS)) {
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
      message,
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
        // Create a safer type so the keys do not need to be checked with ifs
        let beatmapId;
        if (
          "beatmapIdB" in matchGroups &&
          matchGroups.beatmapIdB !== undefined
        ) {
          beatmapId = matchGroups.beatmapIdB;
        }
        if (
          "beatmapIdBeatmaps" in matchGroups &&
          matchGroups.beatmapIdBeatmaps !== undefined
        ) {
          beatmapId = matchGroups.beatmapIdBeatmaps;
        }
        if (
          "beatmapIdBeatmapsets" in matchGroups &&
          matchGroups.beatmapIdBeatmapsets !== undefined
        ) {
          beatmapId = matchGroups.beatmapIdBeatmapsets;
        }
        if (
          "beatmapIdBeatmapsetsDownload" in matchGroups &&
          matchGroups.beatmapIdBeatmapsetsDownload !== undefined
        ) {
          beatmapId = matchGroups.beatmapIdBeatmapsetsDownload;
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
