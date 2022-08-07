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
  LOG_ID_CHAT_HANDLER_OSU,
  LOG_ID_COMMAND_OSU,
  OsuCommands,
} from "../osu";
import {
  MacroOsuWindowTitle,
  macroOsuWindowTitleId,
} from "../../messageParser/macros/osuWindowTitle";
import {
  osuCommandReplyNp,
  osuCommandReplyNpNoMap,
  osuCommandReplyNpNoMapStreamCompanion,
  osuCommandReplyNpStreamCompanion,
  osuCommandReplyNpStreamCompanionNotRunning,
} from "../../strings/osu/commandReply";
import { createLogFunc } from "../../logging";
import { getProcessWindowTitle } from "../../other/processInformation";
import { messageParserById } from "../../messageParser";
// Type imports
import type { Macros, Plugins } from "../../messageParser";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { OsuApiV2Credentials } from "../osu";
import type { StreamCompanionConnection } from "../../streamcompanion";
import type { Strings } from "../../strings";

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

const ROUND_TO_1_DIGIT_FACTOR = 10;

export const roundToOneDecimalPlace = (num: undefined | number) => {
  if (num === undefined) {
    return 0;
  }
  return Math.round(num * ROUND_TO_1_DIGIT_FACTOR) / ROUND_TO_1_DIGIT_FACTOR;
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
  osuStreamCompanionCurrentMapData: StreamCompanionConnection | undefined,
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

  const logCmdNp = createLogFunc(logger, LOG_ID_CHAT_HANDLER_OSU, {
    subsection: OsuCommands.NP,
  });

  let message = await messageParserById(
    osuCommandReplyNpNoMap.id,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  );

  if (osuStreamCompanionCurrentMapData !== undefined) {
    const currentMapData = osuStreamCompanionCurrentMapData();
    if (
      currentMapData !== undefined &&
      currentMapData.mapid !== undefined &&
      currentMapData.mapid !== 0
    ) {
      message = await messageParserById(
        osuCommandReplyNpStreamCompanion.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
    } else if (
      currentMapData !== undefined &&
      currentMapData.mapid !== undefined &&
      currentMapData.mapid === 0
    ) {
      message = await messageParserById(
        osuCommandReplyNpNoMapStreamCompanion.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
    } else {
      message = await messageParserById(
        osuCommandReplyNpStreamCompanionNotRunning.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
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
        let mapId;
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
                  // eslint-disable-next-line no-magic-numbers
                  match[3].trim().toLocaleLowerCase()
              );
              return titleIsTheSame && diffNameCanBeFound;
            });
            if (exactMatch) {
              const exactBeatmapDiff = exactMatch.beatmaps?.find(
                (a) =>
                  a.version.trim().toLocaleLowerCase() ===
                  // eslint-disable-next-line no-magic-numbers
                  match[3].trim().toLocaleLowerCase()
              );
              if (exactBeatmapDiff) {
                mapId = exactBeatmapDiff.id;
              }
            }
          }
        } catch (err) {
          logCmdNp.warn((err as Error).message);
        }
        const customMacros = new Map(globalMacros);
        customMacros.set(
          macroOsuWindowTitleId,
          new Map([
            [MacroOsuWindowTitle.TITLE, `${match[2]}`],
            [MacroOsuWindowTitle.ARTIST, `${match[1]}`],
            // eslint-disable-next-line no-magic-numbers
            [MacroOsuWindowTitle.VERSION, `${match[3]}`],
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            [MacroOsuWindowTitle.MAP_ID_VIA_API, `${mapId}`],
          ])
        );
        message = await messageParserById(
          osuCommandReplyNp.id,
          globalStrings,
          globalPlugins,
          customMacros,
          logger
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
