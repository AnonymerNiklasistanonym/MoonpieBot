// Package imports
import osuApiV2, {
  GameMode,
  OsuApiV2WebRequestError,
  RankedStatus,
} from "osu-api-v2";
// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  loggerCommand,
} from "../commandHelper";
import { mapUserScoreToStr, mapToStr } from "../../other/osuStringBuilder";
import { OsuApiV2Credentials } from "../osu";
// Type imports
import type { Client as IrcClient } from "irc";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { isProcessRunning } from "../../other/processInformation";

/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param osuApiV2Credentials The osu API (v2) credentials.
 * @param defaultOsuId Default osu account ID (used for checking for existing
 * scores).
 * @param beatmapId The recognized osu beatmap ID.
 * @param osuIrcBot The osu IRC instance (used for sending requests to osu
 * client using IRC).
 * @param osuIrcRequestTarget The osu account ID to whom the IRC request should
 * be sent to.
 * @param logger Logger (used for global logs).
 */
export const commandBeatmap = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials,
  defaultOsuId: number,
  beatmapId: number,
  osuIrcBot: (() => IrcClient) | undefined,
  osuIrcRequestTarget: undefined | string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

  // Get beatmap and if found the current top score and convert them into a
  // message for Twitch and IRC channel
  let beatmapInformationWasFound = false;
  let message = "";
  let messageIrc = "";
  try {
    const beatmap = await osuApiV2.beatmaps.get(oauthAccessToken, beatmapId);
    beatmapInformationWasFound = true;
    message = mapToStr(beatmap);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    messageIrc = `${userName} requested [https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset?.id}#osu/${beatmap.id} ${beatmap.beatmapset?.title} '${beatmap.version}' by ${beatmap.beatmapset?.artist}]`;
    if (
      beatmap.ranked === RankedStatus.loved ||
      beatmap.ranked === RankedStatus.qualified ||
      beatmap.ranked === RankedStatus.ranked
    ) {
      try {
        const score = await osuApiV2.beatmaps.scores.users(
          oauthAccessToken,
          beatmapId,
          defaultOsuId,
          GameMode.osu,
          undefined
        );
        message += ` Current top score is ${mapUserScoreToStr(score)}`;
      } catch (err) {
        message += ` No score found`;
      }
    }
  } catch (err) {
    if ((err as OsuApiV2WebRequestError).statusCode === 404) {
      logger.warn(err);
      throw Error("osu! beatmap was not found");
    } else {
      throw err;
    }
  }

  // Send response to Twitch channel and if found to IRC channel
  await Promise.all([
    client.say(channel, message).then((sentMessage) => {
      loggerCommand(
        logger,
        `Successfully replied to message ${messageId}: '${JSON.stringify(
          sentMessage
        )}'`,
        { commandId: "osuBeatmap" }
      );
    }),
    new Promise<void>((resolve, reject) => {
      if (!beatmapInformationWasFound) {
        logger.debug(
          "osu! beatmap information was not found, stop attempt sending beatmap over IRC channel"
        );
        return resolve();
      }
      isProcessRunning("osu")
        .then((osuIsRunning) => {
          if (!osuIsRunning) {
            logger.debug(
              "osu! was not found running, stop attempt sending beatmap over IRC channel"
            );
            return resolve();
          }
          if (
            osuIrcRequestTarget !== undefined &&
            osuIrcBot !== undefined &&
            osuIsRunning
          ) {
            logger.info("Try to create an osu IRC connection");
            try {
              let osuIrcBotInstance: undefined | IrcClient = osuIrcBot();
              logger.info("Try to connect to osu IRC channel");
              osuIrcBotInstance.connect(2, () => {
                logger.info("osu! IRC connection was established");
                osuIrcBotInstance?.say(osuIrcRequestTarget, messageIrc);
                osuIrcBotInstance?.say(osuIrcRequestTarget, `${message}`);
                osuIrcBotInstance?.disconnect("", () => {
                  osuIrcBotInstance?.conn.end();
                  osuIrcBotInstance = undefined;
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  logger.info(
                    `osu! IRC connection was closed": ${JSON.stringify(
                      osuIrcBotInstance
                    )}`
                  );
                  return resolve();
                });
              });
            } catch (err) {
              return reject(err);
            }
          } else {
            return resolve();
          }
        })
        .catch(reject);
    }),
  ]);
};
