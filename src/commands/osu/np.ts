// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  loggerCommand,
} from "../commandHelper";
import { errorMessageOsuApiCredentialsUndefined } from "../osu";
import { getProcessWindowTitle } from "../../other/processInformation";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { StreamCompanionData } from "../../index";
import type { OsuApiV2Credentials } from "../osu";

/**
 * Regex to parse the now playing window title on Windows.
 * The first capture group is the artist, the second the title and the third
 * the name of the difficulty.
 *
 * @example
 * ```text
 * osu! - Artist - Title [Difficulty]
 * ```
 * @example
 * ```text
 * osu! - Artist - Title [TV Size] [Difficulty]
 * ```
 */
export const regexNowPlaying =
  /^(?:.+?)\s-\s\s*(.+?)\s*\s-\s\s*(.+?)\s*\[\s*([^\s[\]]+?)\s*\]$/;

export const roundToOneDecimalPlace = (num: undefined | number) => {
  if (num === undefined) {
    return 0;
  }
  return Math.round(num * 10) / 10;
};

/**
 * NP (now playing) command: Send the map that is currently being played in osu
 * (via the window title because the web api is not supporting it).
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param osuApiV2Credentials The osu API (v2) credentials.
 * @param osuStreamCompanionCurrentMapData If available get the current map data using StreamCompanion.
 * @param logger Logger (used for logging).
 */
export const commandNp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials | undefined,
  osuStreamCompanionCurrentMapData:
    | (() => StreamCompanionData | undefined)
    | undefined,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }
  let message = `@${userName} No map is currently being played`;

  if (osuStreamCompanionCurrentMapData !== undefined) {
    const currentMapData = osuStreamCompanionCurrentMapData();
    if (currentMapData !== undefined && currentMapData.mapid !== undefined) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      message = `@${userName} Currently playing '${currentMapData.titleRoman}' from '${currentMapData.artistRoman}' [${currentMapData.diffName}]`;
      if (
        currentMapData.mods !== undefined &&
        currentMapData?.mods !== "None"
      ) {
        message += ` with ${currentMapData.mods}`;
      }
      message += ` - CS ${roundToOneDecimalPlace(
        currentMapData.mCS
      )}, AR ${roundToOneDecimalPlace(
        currentMapData.mAR
      )}, OD ${roundToOneDecimalPlace(
        currentMapData.mOD
      )}, HP ${roundToOneDecimalPlace(currentMapData.mHP)}, BPM ${
        currentMapData.mBpm === undefined ? 0 : currentMapData.mBpm
      }, ${roundToOneDecimalPlace(
        currentMapData.maxCombo
      )}x ${roundToOneDecimalPlace(currentMapData.mStars)}*`;
      if (currentMapData.mapid === undefined || currentMapData.mapid === 0) {
        if (
          currentMapData.mapsetid === undefined ||
          currentMapData.mapsetid === 0
        ) {
          message += " (StreamCompanion)";
        } else {
          message += ` (https://osu.ppy.sh/beatmapsets/${currentMapData.mapsetid} - StreamCompanion)`;
        }
      } else {
        message += ` (https://osu.ppy.sh/beatmaps/${currentMapData.mapid} - StreamCompanion)`;
      }
    } else {
      message += " (StreamCompanion was configured but not found running!)";
    }
  } else {
    if (osuApiV2Credentials === undefined) {
      throw errorMessageOsuApiCredentialsUndefined();
    }
    const windowTitle = await getProcessWindowTitle("osu");
    if (windowTitle !== undefined && windowTitle !== "osu!") {
      const match = windowTitle.match(regexNowPlaying);
      if (match != null) {
        message = `@${userName} Currently playing '${match[2]}' from '${match[1]}' [${match[3]}]`;
        try {
          const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
            osuApiV2Credentials.clientId,
            osuApiV2Credentials.clientSecret
          );

          const searchResult = await osuApiV2.beatmapsets.search(
            oauthAccessToken,
            `title='${match[2]}' artist='${match[1]}'`,
            false
          );
          if (
            searchResult.beatmapsets !== undefined &&
            Array.isArray(searchResult.beatmapsets) &&
            searchResult.beatmapsets.length >= 1
          ) {
            const exactMatch = searchResult.beatmapsets.find((a) => {
              const titleIsTheSame =
                a.title.trim().toLocaleLowerCase() ===
                match[2].trim().toLocaleLowerCase();
              const diffNameCanBeFound = a.beatmaps?.find(
                (b) =>
                  b.version.trim().toLocaleLowerCase() ===
                  match[3].trim().toLocaleLowerCase()
              );
              return titleIsTheSame && diffNameCanBeFound;
            });
            if (exactMatch) {
              const exactBeatmapDiff = exactMatch.beatmaps?.find(
                (a) =>
                  a.version.trim().toLocaleLowerCase() ===
                  match[3].trim().toLocaleLowerCase()
              );
              if (exactBeatmapDiff) {
                message += ` (https://osu.ppy.sh/beatmaps/${exactBeatmapDiff.id})`;
              }
            }
          }
        } catch (err) {
          logger.warn(err);
        }
      }
    }
  }
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuNp" }
  );
};
