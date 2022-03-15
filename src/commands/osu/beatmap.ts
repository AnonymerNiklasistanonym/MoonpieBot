// Package imports
import osuApiV2, {
  GameMode,
  OsuApiV2WebRequestError,
  RankedStatus,
} from "osu-api-v2";
// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
import { mapUserScoreToStr, mapToStr } from "../../other/osuStringBuilder";
import { OsuApiV2Credentials } from "../osu";
// Type imports
import type { Client as IrcClient } from "irc";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { isProcessRunning } from "../../other/processInformation";

/*
export const osuIsConnectedApi = async (
  oauthAccessToken: OAuthAccessToken,
  defaultOsuId: number
) => {
  const user = await osuApiV2.users.id(oauthAccessToken, defaultOsuId);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`user[${defaultOsuId}].is_online=${user.is_online}`);
  // TODO: The new API only accounts for lazer or the website...
  return false;
};
*/

/**
 * Post information about a map and if existing the top score in the chat
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param osuApiV2Credentials Osu API (v2) credentials
 * @param defaultOsuId The default Osu account ID that should be fetched
 * @param customOsuId If a custom Osu account ID is provided fetch this instead
 * @param logger Logger (used for logging)
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

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

  let tryToSendBeatmapToTarget = false;
  let message = "";
  let messageIrc = "";
  try {
    const beatmap = await osuApiV2.beatmaps.lookup(oauthAccessToken, beatmapId);
    tryToSendBeatmapToTarget = true;
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
      throw Error("Beatmap was not found");
    } else {
      throw err;
    }
  }

  await Promise.all([
    client.say(channel, message).then((sentMessage) => {
      loggerCommand(
        logger,
        `Successfully replied to message ${messageId}: '${JSON.stringify(
          sentMessage
        )}'`,
        { commandId: "osuRp" }
      );
    }),
    isProcessRunning("osu").then(
      (osuIsRunning) =>
        new Promise<void>((resolve, reject) => {
          if (!tryToSendBeatmapToTarget) {
            return resolve();
          }
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          logger.info(`Osu is connected: ${osuIsRunning}`);
          if (
            osuIrcRequestTarget !== undefined &&
            osuIrcBot !== undefined &&
            osuIsRunning
          ) {
            logger.info("Create IRC connection 1");
            try {
              let osuIrcBotInstance: undefined | IrcClient = osuIrcBot();
              logger.info("Create IRC connection 2");
              osuIrcBotInstance.connect(2, () => {
                logger.info("Osu IRC was connected");
                osuIrcBotInstance?.say(osuIrcRequestTarget, messageIrc);
                osuIrcBotInstance?.say(osuIrcRequestTarget, `${message}`);
                osuIrcBotInstance?.disconnect("", () => {
                  osuIrcBotInstance?.conn.end();
                  osuIrcBotInstance = undefined;
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  logger.info(
                    `Osu IRC was disconnected: ${JSON.stringify(
                      osuIrcBotInstance
                    )}`
                  );
                  resolve();
                });
              });
            } catch (err) {
              reject();
            }
          } else {
            resolve();
          }
        })
    ),
  ]);
};
