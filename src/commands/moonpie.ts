import {
  commandUserGet,
  commandUserSetCount,
  commandUserDelete,
} from "./moonpie/user";
import { commandCommands } from "./moonpie/commands";
import { commandAbout } from "./moonpie/about";
import { commandLeaderboard } from "./moonpie/leaderboard";
import { commandClaim } from "./moonpie/claim";
import { parseTwitchBadgeLevel } from "../other/twitchBadgeParser";
import { errorMessageUserNameUndefined, logTwitchMessageCommandDetected } from "../commands";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import { Macros, Plugins } from "src/messageParser";
import { Strings } from "src/strings";

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

export const moonpieChatHandler = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  databasePath: string,
  enabled: string[] = [
    MoonpieCommands.ABOUT,
    MoonpieCommands.ADD,
    MoonpieCommands.CLAIM,
    MoonpieCommands.COMMANDS,
    MoonpieCommands.DELETE,
    MoonpieCommands.GET,
    MoonpieCommands.LEADERBOARD,
    MoonpieCommands.REMOVE,
    MoonpieCommands.SET,
  ],
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (message.match(regexMoonpie)) {
    // Update plugins/macros for message parser
    const plugins = new Map(globalPlugins);
    plugins.set("USER", () => {
      if (tags.username === undefined) {
        throw errorMessageUserNameUndefined();
      }
      return tags.username;
    });
    // > !moonpie commands
    if (
      message.match(regexMoonpieCommands) &&
      enabled.includes(MoonpieCommands.COMMANDS)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.COMMANDS,
        LOG_ID_MODULE_MOONPIE
      );
      await commandCommands(client, channel, tags.id, enabled, logger);
      return;
    }
    // > !moonpie leaderboard
    if (
      message.match(regexMoonpieLeaderboard) &&
      enabled.includes(MoonpieCommands.LEADERBOARD)
    ) {
      logTwitchMessageCommandDetected(
        logger,
        tags.id,
        [tags.username ? `#${tags.username}` : "undefined", message],
        LOG_ID_COMMAND_MOONPIE,
        MoonpieCommands.LEADERBOARD,
        LOG_ID_MODULE_MOONPIE
      );
      await commandLeaderboard(client, channel, tags.id, databasePath, logger);
      return;
    }
    // > !moonpie about
    if (
      message.match(regexMoonpieAbout) &&
      enabled.includes(MoonpieCommands.ABOUT)
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
        tags.id,
        globalStrings,
        plugins,
        globalMacros,
        logger
      );
      return;
    }
    // > !moonpie delete $USER
    if (
      message.match(regexMoonpieDelete) &&
      enabled.includes(MoonpieCommands.DELETE)
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
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User was not found for !moonpie delete $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie get $USER
    if (
      message.match(regexMoonpieGet) &&
      enabled.includes(MoonpieCommands.GET)
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
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User was not found for !moonpie get $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie set $USER (only broadcaster badge)
    if (
      message.match(regexMoonpieSet) &&
      enabled.includes(MoonpieCommands.SET)
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
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User/NewCount was not found for !moonpie set $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie add $USER $COUNT (only broadcaster badge)
    if (
      message.match(regexMoonpieAdd) &&
      enabled.includes(MoonpieCommands.ADD)
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
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User/CountToAdd was not found for !moonpie add $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie remove $USER $COUNT (only broadcaster badge)
    if (
      message.match(regexMoonpieRemove) &&
      enabled.includes(MoonpieCommands.REMOVE)
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
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User/CountToRemove was not found for !moonpie remove $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie ($MESSAGE)
    if (
      message.match(regexMoonpieClaim) &&
      enabled.includes(MoonpieCommands.CLAIM)
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
        tags.id,
        tags.username,
        tags["user-id"],
        databasePath,
        logger
      );
      return;
    }
  }
};
