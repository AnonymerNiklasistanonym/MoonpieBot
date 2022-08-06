// Local imports
import {
  commandUserDelete,
  commandUserGet,
  commandUserSetCount,
} from "./moonpie/user";
import { commandAbout } from "./moonpie/about";
import { commandClaim } from "./moonpie/claim";
import { commandCommands } from "./moonpie/commands";
import { commandLeaderboard } from "./moonpie/leaderboard";
import { logTwitchMessageCommandDetected } from "../commands";
import { parseTwitchBadgeLevel } from "../other/twitchBadgeParser";
// Type imports
import type { TwitchChatHandler } from "../twitch";

/**
 * The logging ID of this command.
 */
export const LOG_ID_COMMAND_MOONPIE = "moonpie";
/**
 * The logging ID of this module.
 */
export const LOG_ID_MODULE_MOONPIE = "moonpie";

export enum MoonpieCommands {
  ABOUT = "about",
  ADD = "add",
  CLAIM = "claim",
  COMMANDS = "commands",
  DELETE = "delete",
  GET = "get",
  LEADERBOARD = "leaderboard",
  REMOVE = "remove",
  SET = "set",
}

/**
 * Regex to recognize all possible commands that start with `!moonpie`.
 *
 * @example
 * ```text
 * !moonpie
 * !moonpie set
 * !moonpie abcde 1234
 * ```
 */
export const regexMoonpie = /^\s*!moonpie(\s*|\s.*)$/i;

/**
 * Regex to recognize the `!moonpie` command.
 *
 * @example
 * ```text
 * !moonpie
 * !moonpie Give me moonpie pls
 * ```
 */
export const regexMoonpieClaim = /^\s*!moonpie(\s*|\s.*)$/i;

/**
 * Regex to recognize the `!moonpie commands` command.
 *
 * @example
 * ```text
 * !moonpie commands
 * ```
 */
export const regexMoonpieCommands = /^\s*!moonpie\s+commands\s*$/i;

/**
 * Regex to recognize the `!moonpie leaderboard` command.
 *
 * @example
 * ```text
 * !moonpie leaderboard
 * ```
 */
export const regexMoonpieLeaderboard = /^\s*!moonpie\s+leaderboard\s*$/i;

/**
 * Regex to recognize the `!moonpie about` command.
 *
 * @example
 * ```text
 * !moonpie about
 * ```
 */
export const regexMoonpieAbout = /^\s*!moonpie\s+about\s*$/i;

/**
 * Regex to recognize the `!moonpie get $USER` command.
 *
 * - The first group is the user name string.
 *
 * @example
 * ```text
 * !moonpie get alexa123
 * ```
 */
export const regexMoonpieGet = /^\s*!moonpie\s+get\s+(\S+)\s*$/i;

/**
 * Regex to recognize the `!moonpie set $USER $COUNT` command.
 *
 * - The first group is the user name string.
 * - The second group is the moonpie count that should be set.
 *
 * @example
 * ```text
 * !moonpie set alexa123 727
 * ```
 */
export const regexMoonpieSet = /^\s*!moonpie\s+set\s+(\S+)\s+([0-9]+)\s*$/i;

/**
 * Regex to recognize the `!moonpie add $USER $COUNT` command.
 *
 * - The first group is the user name string.
 * - The second group is the moonpie count that should be added.
 *
 * @example
 * ```text
 * !moonpie add alexa123 3
 * ```
 */
export const regexMoonpieAdd = /^\s*!moonpie\s+add\s+(\S+)\s+([0-9]+)\s*$/i;

/**
 * Regex to recognize the `!moonpie remove $USER $COUNT` command.
 *
 * - The first group is the user name string.
 * - The second group is the moonpie count that should be removed.
 *
 * @example
 * ```text
 * !moonpie remove alexa123 4
 * ```
 */
export const regexMoonpieRemove =
  /^\s*!moonpie\s+remove\s+(.*?)\s+([0-9]+)\s*$/i;

/**
 * Regex to recognize the `!moonpie delete $USER` command.
 *
 * - The first group is the user name string.
 *
 * @example
 * ```text
 * !moonpie delete alexa123
 * ```
 */
export const regexMoonpieDelete = /^\s*!moonpie\s+delete\s+(\S+)\s*$/i;

export interface MoonpieChatHandlerData {
  databasePath: string;
  moonpieCooldownHoursNumber: number;
  enabled: (MoonpieCommands | string)[];
}

export const moonpieChatHandler: TwitchChatHandler<
  MoonpieChatHandlerData
> = async (
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
  if (message.match(regexMoonpie)) {
    // > !moonpie commands
    if (
      message.match(regexMoonpieCommands) &&
      data.enabled.includes(MoonpieCommands.COMMANDS)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.COMMANDS,
        LOG_ID_MODULE_MOONPIE
      );
      await commandCommands(
        client,
        channel,
        tags.id,
        data.enabled,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      return;
    }
    // > !moonpie leaderboard
    if (
      message.match(regexMoonpieLeaderboard) &&
      data.enabled.includes(MoonpieCommands.LEADERBOARD)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.LEADERBOARD,
        LOG_ID_MODULE_MOONPIE
      );
      await commandLeaderboard(
        client,
        channel,
        tags.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        data.databasePath,
        logger
      );
      return;
    }
    // > !moonpie about
    if (
      message.match(regexMoonpieAbout) &&
      data.enabled.includes(MoonpieCommands.ABOUT)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.ABOUT,
        LOG_ID_MODULE_MOONPIE
      );
      await commandAbout(
        client,
        channel,
        tags,
        message,
        undefined,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      return;
    }
    // > !moonpie delete $USER
    if (
      message.match(regexMoonpieDelete) &&
      data.enabled.includes(MoonpieCommands.DELETE)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.DELETE,
        LOG_ID_MODULE_MOONPIE
      );
      const match = regexMoonpieDelete.exec(message);
      if (match && match.length >= 2) {
        await commandUserDelete(
          client,
          channel,
          tags.id,
          tags.username,
          tags["user-id"],
          match[1],
          parseTwitchBadgeLevel(tags),
          globalStrings,
          globalPlugins,
          globalMacros,
          data.databasePath,
          logger
        );
      }
      return;
    }
    // > !moonpie get $USER
    if (
      message.match(regexMoonpieGet) &&
      data.enabled.includes(MoonpieCommands.GET)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.GET,
        LOG_ID_MODULE_MOONPIE
      );
      const match = regexMoonpieGet.exec(message);
      if (match && match.length >= 2) {
        await commandUserGet(
          client,
          channel,
          tags.id,
          tags.username,
          tags["user-id"],
          match[1],
          globalStrings,
          globalPlugins,
          globalMacros,
          data.databasePath,
          logger
        );
      }
      return;
    }
    // > !moonpie set $USER (only broadcaster badge)
    if (
      message.match(regexMoonpieSet) &&
      data.enabled.includes(MoonpieCommands.SET)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.SET,
        LOG_ID_MODULE_MOONPIE
      );
      const match = regexMoonpieSet.exec(message);
      if (match && match.length >= 3) {
        await commandUserSetCount(
          client,
          channel,
          tags.id,
          tags.username,
          tags["user-id"],
          match[1],
          parseInt(match[2]),
          "=",
          parseTwitchBadgeLevel(tags),
          globalStrings,
          globalPlugins,
          globalMacros,
          data.databasePath,
          logger
        );
      }
      return;
    }
    // > !moonpie add $USER $COUNT (only broadcaster badge)
    if (
      message.match(regexMoonpieAdd) &&
      data.enabled.includes(MoonpieCommands.ADD)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.ADD,
        LOG_ID_MODULE_MOONPIE
      );
      const match = regexMoonpieAdd.exec(message);
      if (match && match.length >= 3) {
        await commandUserSetCount(
          client,
          channel,
          tags.id,
          tags.username,
          tags["user-id"],
          match[1],
          parseInt(match[2]),
          "+",
          parseTwitchBadgeLevel(tags),
          globalStrings,
          globalPlugins,
          globalMacros,
          data.databasePath,
          logger
        );
      }
      return;
    }
    // > !moonpie remove $USER $COUNT (only broadcaster badge)
    if (
      message.match(regexMoonpieRemove) &&
      data.enabled.includes(MoonpieCommands.REMOVE)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.REMOVE,
        LOG_ID_MODULE_MOONPIE
      );
      const match = regexMoonpieRemove.exec(message);
      if (match && match.length >= 3) {
        await commandUserSetCount(
          client,
          channel,
          tags.id,
          tags.username,
          tags["user-id"],
          match[1],
          parseInt(match[2]),
          "-",
          parseTwitchBadgeLevel(tags),
          globalStrings,
          globalPlugins,
          globalMacros,
          data.databasePath,
          logger
        );
      }
      return;
    }
    // > !moonpie ($MESSAGE)
    if (
      message.match(regexMoonpieClaim) &&
      data.enabled.includes(MoonpieCommands.CLAIM)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.CLAIM,
        LOG_ID_MODULE_MOONPIE
      );
      await commandClaim(
        client,
        channel,
        tags,
        message,
        {
          moonpieDbPath: data.databasePath,
          moonpieClaimCooldownHours: data.moonpieCooldownHoursNumber,
        },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      return;
    }
  }
};
