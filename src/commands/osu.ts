import {
  commandBeatmap,
  commandBeatmapWhenDisabled,
  commandSetBeatmapRequests,
} from "./osu/beatmap";
import { commandNp } from "./osu/np";
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";
import { parseTwitchBadgeLevel } from "../other/twitchBadgeParser";
import { logTwitchMessageCommandDetected } from "../commands";
// Type imports
import type { Client as IrcClient } from "irc";
import type { StreamCompanionData } from "../streamcompanion";
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../strings";
import type { Macros, Plugins } from "../messageParser";

/**
 * The logging ID of this command.
 */
export const LOG_ID_COMMAND_OSU = "osu";

/**
 * The logging ID of this module.
 */
export const LOG_ID_MODULE_OSU = "osu";

export enum OsuCommands {
  PP = "pp",
  NP = "np",
  RP = "rp",
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
 * Regex to recognize the !osu requests enable command.
 *
 * @example
 * ```text
 * !osu requests on
 * ```
 */
export const regexEnableBeatmapRequests =
  /^\s*!osu\s+requests\s+on(?:\s*|\s+.*)$/i;

/**
 * Regex to recognize the !osu requests disable command.
 *
 * @example
 * ```text
 * !osu requests off $OPTIONAL_TEXT
 * ```
 */
export const regexDisableBeatmapRequests =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!osu\s+requests\s+off\s*?(?:\s+(.*?)\s*)?$/i;

export interface OsuApiV2Credentials {
  clientId: number;
  clientSecret: string;
}

let runtimeToggleEnableBeatmapRequests = true;
let runtimeToggleDisableBeatmapRequestsCustomMessage: string | undefined =
  undefined;

export const osuChatHandler = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  osuApiV2Credentials: OsuApiV2Credentials | undefined,
  osuDefaultId: number,
  enableOsuBeatmapRequests: undefined | boolean,
  enableOsuBeatmapRequestsDetailed: undefined | boolean,
  osuIrcBot: (() => IrcClient) | undefined,
  osuIrcRequestTarget: undefined | string,
  osuStreamCompanionCurrentMapData:
    | (() => StreamCompanionData | undefined)
    | undefined,
  enabled: undefined | string[],
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (enabled === undefined) {
    enabled = [OsuCommands.NP, OsuCommands.PP, OsuCommands.RP];
  }
  // > !np
  if (message.match(regexNp) && enabled?.includes(OsuCommands.NP)) {
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
      osuApiV2Credentials,
      osuStreamCompanionCurrentMapData,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    return;
  }
  // > !rp
  if (message.match(regexRp) && enabled?.includes(OsuCommands.RP)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_OSU,
      OsuCommands.RP,
      LOG_ID_MODULE_OSU
    );
    const matchId = regexRpCustomId.exec(message);
    const matchName = regexRpCustomName.exec(message);
    await commandRp(
      client,
      channel,
      tags.id,
      osuApiV2Credentials,
      osuDefaultId,
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
  if (message.match(regexPp) && enabled?.includes(OsuCommands.PP)) {
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username ? `#${tags.username}` : "undefined", message],
      LOG_ID_COMMAND_OSU,
      OsuCommands.PP,
      LOG_ID_MODULE_OSU
    );
    const matchId = regexPpCustomId.exec(message);
    const matchName = regexPpCustomName.exec(message);
    await commandPp(
      client,
      channel,
      tags.id,
      osuApiV2Credentials,
      osuDefaultId,
      matchId && matchId.length >= 2 ? parseInt(matchId[1]) : undefined,
      matchName && matchName.length >= 2 ? matchName[1] : undefined,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    return;
  }
  // > Any beatmap link
  if (enableOsuBeatmapRequests) {
    if (
      message.match(regexEnableBeatmapRequests) ||
      message.match(regexDisableBeatmapRequests)
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
            await commandBeatmap(
              client,
              channel,
              tags.id,
              tags.username,
              osuApiV2Credentials,
              match[1] !== undefined ? parseInt(match[1]) : parseInt(match[2]),
              match[3],
              enableOsuBeatmapRequestsDetailed,
              osuIrcBot,
              osuIrcRequestTarget,
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
