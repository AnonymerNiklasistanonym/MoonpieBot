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
import { handleTwitchCommand } from "../twitch";
import { logTwitchMessageCommandDetected } from "../commands";
import { OsuCommands } from "../info/commands";
import { parseTwitchBadgeLevel } from "../other/twitchBadgeParser";
// Type imports
import type { CommandHandlerNpData } from "./osu/np";
import type { CommandHandlerPpRpData } from "./osu/pp";
import type { Client as IrcClient } from "irc";
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

let globalLastBeatmapId: number | undefined;
let globalRuntimeToggleEnableBeatmapRequests = true;
let globalRuntimeToggleDisableBeatmapRequestsCustomMessage: string | undefined;

export interface OsuChatHandlerData
  extends CommandHandlerPpRpData,
    CommandHandlerNpData {
  enableOsuBeatmapRequests?: boolean;
  enableOsuBeatmapRequestsDetailed?: boolean;
  osuIrcBot?: (id: string) => IrcClient;
  osuIrcRequestTarget?: string;
}

export const osuChatHandler: TwitchChatHandler<OsuChatHandlerData> = async (
  client,
  channel,
  tags,
  message,
  data,
  enabled,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
) => {
  // Handle commands
  const commands = [commandNp, commandPp, commandRp];
  await Promise.all(
    commands.map((command) =>
      handleTwitchCommand(
        client,
        channel,
        tags,
        message,
        data,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command,
        enabled
      )
    )
  );
  // > !score
  if (message.match(regexScore) && enabled.includes(OsuCommands.SCORE)) {
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
      globalLastBeatmapId,
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
      enabled.includes(OsuCommands.REQUESTS)
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
        globalRuntimeToggleEnableBeatmapRequests = true;
      } else {
        logTwitchMessageCommandDetected(
          logger,
          tags.id,
          [tags.username ? `#${tags.username}` : "undefined", message],
          LOG_ID_COMMAND_OSU,
          "disable_beatmap_requests",
          LOG_ID_MODULE_OSU
        );
        globalRuntimeToggleEnableBeatmapRequests = false;
        if (matchDisable != null && matchDisable.length >= 2) {
          globalRuntimeToggleDisableBeatmapRequestsCustomMessage =
            matchDisable[1];
        }
      }
      await commandSetBeatmapRequests(
        client,
        channel,
        tags.id,
        tags.username,
        parseTwitchBadgeLevel(tags),
        globalRuntimeToggleEnableBeatmapRequests,
        globalRuntimeToggleDisableBeatmapRequestsCustomMessage,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      return;
    } else if (
      message.match(regexBeatmapRequestsStatus) &&
      enabled.includes(OsuCommands.REQUESTS)
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
        globalRuntimeToggleEnableBeatmapRequests,
        globalRuntimeToggleDisableBeatmapRequestsCustomMessage,
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
      if (!globalRuntimeToggleEnableBeatmapRequests) {
        await commandBeatmapWhenDisabled(
          client,
          channel,
          tags.id,
          tags.username,
          globalRuntimeToggleDisableBeatmapRequestsCustomMessage,
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
            globalLastBeatmapId = beatmapId;
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
