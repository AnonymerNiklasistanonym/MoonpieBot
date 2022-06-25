// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import {
  errorMessageOsuApiCredentialsUndefined,
  OsuCommands,
  LOG_ID_COMMAND_OSU,
} from "../osu";
import { getProcessWindowTitle } from "../../other/processInformation";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { StreamCompanionData } from "../../streamcompanion";
import type { OsuApiV2Credentials } from "../osu";
import { Macros, messageParser, Plugins } from "../../messageParser";
import type { Strings } from "../../strings";
import {
  osuCommandReplyNp,
  osuCommandReplyNpNoMap,
  osuCommandReplyNpNoMapStreamCompanion,
  osuCommandReplyNpStreamCompanion,
  osuCommandReplyNpStreamCompanionNotRunning,
} from "../../strings/osu/commandReply";

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
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
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
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }
  let message = await messageParser(
    globalStrings.get(osuCommandReplyNpNoMap.id),
    globalPlugins,
    globalMacros
  );

  if (osuStreamCompanionCurrentMapData !== undefined) {
    const currentMapData = osuStreamCompanionCurrentMapData();
    if (
      currentMapData !== undefined &&
      currentMapData.mapid !== undefined &&
      currentMapData.mapid !== 0
    ) {
      message = await messageParser(
        globalStrings.get(osuCommandReplyNpStreamCompanion.id),
        globalPlugins,
        globalMacros
      );
    } else if (
      currentMapData !== undefined &&
      currentMapData.mapid !== undefined &&
      currentMapData.mapid === 0
    ) {
      message = await messageParser(
        globalStrings.get(osuCommandReplyNpNoMapStreamCompanion.id),
        globalPlugins,
        globalMacros
      );
    } else {
      message = await messageParser(
        globalStrings.get(osuCommandReplyNpStreamCompanionNotRunning.id),
        globalPlugins,
        globalMacros
      );
    }
  } else {
    if (osuApiV2Credentials === undefined) {
      throw errorMessageOsuApiCredentialsUndefined();
    }
    const windowTitle = await getProcessWindowTitle("osu");
    if (windowTitle !== undefined && windowTitle !== "osu!") {
      const match = windowTitle.match(regexNowPlaying);
      if (match != null) {
        let mapId = undefined;
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
                mapId = exactBeatmapDiff.id;
              }
            }
          }
        } catch (err) {
          logger.warn(err);
        }
        const customMacros = new Map(globalMacros);
        customMacros.set(
          "OSU_WINDOW_TITLE",
          new Map([
            ["TITLE", `${match[2]}`],
            ["ARTIST", `${match[1]}`],
            ["VERSION", `${match[3]}`],
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            ["MAP_ID_VIA_API", `${mapId}`],
          ])
        );
        message = await messageParser(
          globalStrings.get(osuCommandReplyNp.id),
          globalPlugins,
          customMacros
        );
      }
    }
  }
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_OSU,
    OsuCommands.NP
  );
};
