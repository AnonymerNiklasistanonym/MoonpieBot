// Local imports
import {
  commandBeatmap,
  commandBeatmapRequestsStatus,
  commandBeatmapWhenDisabled,
  commandSetBeatmapRequests,
} from "./osu/beatmap";
import { commandNp } from "./osu/np";
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";
import { commandScore } from "./osu/score";
import { logTwitchMessageCommandDetected } from "../commands";
import { parseTwitchBadgeLevel } from "../other/twitchBadgeParser";
// Type imports
import type { Client as IrcClient } from "irc";
import type { StreamCompanionConnection } from "../streamcompanion";
import type { TwitchChatHandler } from "../twitch";

/**
 * The logging ID of this command.
 */
export const LOG_ID_COMMAND_OSU = "osu";

/**
 * The logging ID of this module.
 */
export const LOG_ID_MODULE_OSU = "osu";

/**
 * The logging ID of this chat handler.
 */
export const LOG_ID_CHAT_HANDLER_OSU = "osu_chat_handler";

export enum OsuCommands {
  PP = "pp",
  NP = "np",
  RP = "rp",
  SCORE = "score",
  REQUESTS = "requests",
}

export enum OsuCommandErrorCode {
  OSU_API_V2_CREDENTIALS_UNDEFINED = "OSU_API_V2_CREDENTIALS_UNDEFINED",
}

export interface OsuCommandError extends Error {
  code?: OsuCommandErrorCode;
}

export const errorMessageOsuApiCredentialsUndefined = () => {
  const error: OsuCommandError = Error(
    "Unable to reply to message! (osuApiV2Credentials is undefined)"
  );
  error.code = OsuCommandErrorCode.OSU_API_V2_CREDENTIALS_UNDEFINED;
  return error;
};

/**
 * Regex to recognize the `!np` command.
 *
 * @example
 * ```text
 * !np $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexNp = /^\s*!np(?:\s*|\s.*)$/i;

/**
 * Regex to recognize the `!rp` command.
 *
 * @example
 * ```text
 * !rp $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexRp = /^\s*!rp(?:\s*|\s.*)$/i;

/**
 * Regex to recognize the `!rp $OPTIONAL_OSU_USER_ID` command.
 *
 * - The first group is the custom osu user ID number.
 *
 * @example
 * ```text
 * !rp 12345 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexRpCustomId = /^\s*!rp\s+([0-9]+)\s*.*$/i;

/**
 * Regex to recognize the `!rp $OPTIONAL_OSU_USER_NAME` command.
 *
 * - The first group is the custom osu user name string.
 *
 * @example
 * ```text
 * !rp osuName $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexRpCustomName = /^\s*!rp\s+(\S+)\s*.*$/i;

/**
 * Regex to recognize the `!score osuName $OPTIONAL_TEXT_WITH_SPACES` command.
 *
 * - The first group is the custom osu user name string.
 *
 * @example
 * ```text
 * !score osuName $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexScore = /^\s*!score\s+(\S+)\s*.*$/i;

/**
 * Regex to recognize the `!pp` command.
 *
 * @example
 * ```text
 * !pp $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexPp = /^\s*!pp(?:\s*|\s.*)$/i;

/**
 * Regex to recognize the `!pp $OPTIONAL_OSU_USER_ID` command.
 *
 * - The first group is the custom osu ID number.
 *
 * @example
 * ```text
 * !pp 12345 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexPpCustomId = /^\s*!pp\s+([0-9]+)\s*.*$/i;

/**
 * Regex to recognize the `!pp $OPTIONAL_OSU_USER_NAME` command.
 *
 * - The first group is the custom osu user name string.
 *
 * @example
 * ```text
 * !pp osuName $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexPpCustomName = /^\s*!pp\s+(\S+)\s*.*$/i;

/**
 * Regex that matches osu beatmap URLs in any message.
 *
 * - The first group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmaps/$ID`.
 * - The second group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmapsets/MAPSETID#osu/$ID`.
 * - The third group is the optional comment string.
 *
 * @example
 * ```text
 * $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 * @example
 * ```text
 * $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmaps/2587891 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexBeatmapUrl =
  // eslint-disable-next-line security/detect-unsafe-regex
  /https:\/\/osu\.ppy\.sh\/(?:beatmaps\/(\d+)|beatmapsets\/\d+#\S+\/(\d+))\s*(?:\s+(.+?))?\s*$/i;

/**
 * Regex to recognize the !osuRequests enable command.
 *
 * @example
 * ```text
 * !osuRequests on
 * ```
 */
export const regexEnableBeatmapRequests =
  /^\s*!osuRequests\s+on(?:\s*|\s+.*)$/i;

/**
 * Regex to recognize the !osuRequests disable command.
 *
 * @example
 * ```text
 * !osuRequests off $OPTIONAL_TEXT
 * ```
 */
export const regexDisableBeatmapRequests =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!osuRequests\s+off\s*?(?:\s+(.*?)\s*)?$/i;

/**
 * Regex to recognize the !osuRequests command.
 *
 * @example
 * ```text
 * !osuRequests $OPTIONAL_TEXT
 * ```
 */
export const regexBeatmapRequestsStatus =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!osuRequests(\s+.*)?$/i;

export interface OsuApiV2Credentials {
  clientId: number;
  clientSecret: string;
}

let lastBeatmapId: number | undefined;
let runtimeToggleEnableBeatmapRequests = true;
let runtimeToggleDisableBeatmapRequestsCustomMessage: string | undefined;

export interface OsuChatHandlerData {
  osuApiV2Credentials?: OsuApiV2Credentials;
  osuDefaultId?: number;
  enableOsuBeatmapRequests?: boolean;
  enableOsuBeatmapRequestsDetailed?: boolean;
  osuIrcBot?: (id: string) => IrcClient;
  osuIrcRequestTarget?: string;
  osuStreamCompanionCurrentMapData?: StreamCompanionConnection;
  enabled: (OsuCommands | string)[];
}

export const osuChatHandler: TwitchChatHandler<OsuChatHandlerData> = async (
  client,
  channel,
  tags,
  message,
  data,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
): Promise<void> => {
  // > !np
  if (message.match(regexNp) && data.enabled.includes(OsuCommands.NP)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_OSU,
      OsuCommands.NP,
      LOG_ID_MODULE_OSU
    );
    await commandNp(
      client,
      channel,
      tags.id,
      tags.username,
      data.osuApiV2Credentials,
      data.osuStreamCompanionCurrentMapData,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    return;
  }
  // > !rp
  if (message.match(regexRp) && data.enabled.includes(OsuCommands.RP)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_OSU,
      OsuCommands.RP,
      LOG_ID_MODULE_OSU
    );
    if (data.osuDefaultId === undefined) {
      throw Error("Default OSU ID was undefined");
    }
    const matchId = regexRpCustomId.exec(message);
    const matchName = regexRpCustomName.exec(message);
    await commandRp(
      client,
      channel,
      tags.id,
      data.osuApiV2Credentials,
      data.osuDefaultId,
      matchId && matchId.length >= 2 ? parseInt(matchId[1]) : undefined,
      matchName && matchName.length >= 2 ? matchName[1] : undefined,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    return;
  }
  // > !pp
  if (message.match(regexPp) && data.enabled.includes(OsuCommands.PP)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_OSU,
      OsuCommands.PP,
      LOG_ID_MODULE_OSU
    );
    if (data.osuDefaultId === undefined) {
      throw Error("Default OSU ID was undefined");
    }
    const matchId = regexPpCustomId.exec(message);
    const matchName = regexPpCustomName.exec(message);
    await commandPp(
      client,
      channel,
      tags.id,
      data.osuApiV2Credentials,
      data.osuDefaultId,
      matchId && matchId.length >= 2 ? parseInt(matchId[1]) : undefined,
      matchName && matchName.length >= 2 ? matchName[1] : undefined,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    return;
  }
  // > !score
  if (message.match(regexScore) && data.enabled.includes(OsuCommands.SCORE)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_OSU,
      OsuCommands.SCORE,
      LOG_ID_MODULE_OSU
    );
    const match = regexScore.exec(message);
    await commandScore(
      client,
      channel,
      tags.id,
      tags.username,
      data.osuApiV2Credentials,
      lastBeatmapId,
      match && match.length >= 2 ? match[1] : undefined,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    return;
  }
  // > Any beatmap link
  if (data.enableOsuBeatmapRequests) {
    if (
      (message.match(regexEnableBeatmapRequests) ||
        message.match(regexDisableBeatmapRequests)) &&
      data.enabled.includes(OsuCommands.REQUESTS)
    ) {
      const matchEnable = message.match(regexEnableBeatmapRequests);
      const matchDisable = message.match(regexDisableBeatmapRequests);
      if (matchEnable) {
        logTwitchMessageCommandDetected(
          logger,
          tags.id,
          [tags.username ? `#${tags.username}` : "undefined", message],
          LOG_ID_COMMAND_OSU,
          "enable_beatmap_requests",
          LOG_ID_MODULE_OSU
        );
        runtimeToggleEnableBeatmapRequests = true;
      } else {
        logTwitchMessageCommandDetected(
          logger,
          tags.id,
          [tags.username ? `#${tags.username}` : "undefined", message],
          LOG_ID_COMMAND_OSU,
          "disable_beatmap_requests",
          LOG_ID_MODULE_OSU
        );
        runtimeToggleEnableBeatmapRequests = false;
        if (matchDisable != null && matchDisable.length >= 2) {
          runtimeToggleDisableBeatmapRequestsCustomMessage = matchDisable[1];
        }
      }
      await commandSetBeatmapRequests(
        client,
        channel,
        tags.id,
        tags.username,
        parseTwitchBadgeLevel(tags),
        runtimeToggleEnableBeatmapRequests,
        runtimeToggleDisableBeatmapRequestsCustomMessage,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      return;
    } else if (
      message.match(regexBeatmapRequestsStatus) &&
      data.enabled.includes(OsuCommands.REQUESTS)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_OSU,
        "beatmap_requests_status",
        LOG_ID_MODULE_OSU
      );
      await commandBeatmapRequestsStatus(
        client,
        channel,
        tags.id,
        tags.username,
        runtimeToggleEnableBeatmapRequests,
        runtimeToggleDisableBeatmapRequestsCustomMessage,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      return;
    }

    // This match does not match all occurences but at least one
    // Don't trigger this command when it's a response to someone
    if (message.match(regexBeatmapUrl) && !message.startsWith("@")) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_OSU,
        "beatmap_detected",
        LOG_ID_MODULE_OSU
      );
      if (!runtimeToggleEnableBeatmapRequests) {
        await commandBeatmapWhenDisabled(
          client,
          channel,
          tags.id,
          tags.username,
          runtimeToggleDisableBeatmapRequestsCustomMessage,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger
        );
      } else {
        const osuBeatmapUrlBegin = "https://osu.ppy.sh/beatmaps";
        const possibleBeatmapRequestsMatches = message
          .split(osuBeatmapUrlBegin)
          .map((a) => `${osuBeatmapUrlBegin}${a}`)
          .map((a) => a.match(regexBeatmapUrl));
        for (const match of [...possibleBeatmapRequestsMatches]) {
          if (match != null) {
            const beatmapId =
              match[1] !== undefined ? parseInt(match[1]) : parseInt(match[2]);
            lastBeatmapId = beatmapId;
            await commandBeatmap(
              client,
              channel,
              tags.id,
              tags.username,
              data.osuApiV2Credentials,
              beatmapId,
              // eslint-disable-next-line no-magic-numbers
              match[3],
              data.enableOsuBeatmapRequestsDetailed,
              data.osuIrcBot,
              data.osuIrcRequestTarget,
              globalStrings,
              globalPlugins,
              globalMacros,
              logger
            );
          }
        }
      }
      return;
    }
  }
};
