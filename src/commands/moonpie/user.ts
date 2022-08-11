// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
  MacroMoonpieUserDelete,
  macroMoonpieUserDelete,
  MacroMoonpieUserNeverClaimed,
  macroMoonpieUserNeverClaimed,
  MacroMoonpieUserSet,
  macroMoonpieUserSet,
} from "../../messageParser/macros/moonpie";
import {
  moonpieUserDelete,
  moonpieUserGet,
  moonpieUserNeverClaimedError,
  moonpieUserPermissionError,
  moonpieUserSet,
  moonpieUserSetNaNError,
} from "../../strings/moonpie/user";
import {
  parseTwitchBadgeLevel,
  TwitchBadgeLevels,
} from "../../other/twitchBadgeParser";
import { errorMessageEnabledCommandsUndefined } from "../../error";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
// Type imports
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";
import type { TwitchChatCommandHandler } from "../../twitch";

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

interface CommandDetectorGetData {
  userNameMoonpieDb: string;
}

export const commandGet: TwitchChatCommandHandler<
  CommandGenericDataMoonpieDbPath,
  CommandDetectorGetData
> = {
  createReply: async (
    client,
    channel,
    _tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    let message;

    if (
      await moonpieDb.existsName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      )
    ) {
      const moonpieEntry = await moonpieDb.getMoonpieName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      );

      const currentMoonpieLeaderboardEntry =
        await moonpieDb.getMoonpieLeaderboardEntry(
          data.moonpieDbPath,
          moonpieEntry.id,
          logger
        );

      const macros = new Map(globalMacros);
      macros.set(
        macroMoonpieLeaderboardEntry.id,
        new Map([
          [MacroMoonpieLeaderboardEntry.NAME, `${data.userNameMoonpieDb}`],
          [
            MacroMoonpieLeaderboardEntry.COUNT,
            `${currentMoonpieLeaderboardEntry.count}`,
          ],
          [
            MacroMoonpieLeaderboardEntry.RANK,
            `${currentMoonpieLeaderboardEntry.rank}`,
          ],
        ])
      );
      message = await messageParserById(
        moonpieUserGet.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
    } else {
      const macros = new Map(globalMacros);
      macros.set(
        macroMoonpieUserNeverClaimed.id,
        new Map([
          [MacroMoonpieUserNeverClaimed.NAME, `${data.userNameMoonpieDb}`],
        ])
      );
      message = await messageParserById(
        moonpieUserNeverClaimedError.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
    }

    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!enabledCommands.includes(MoonpieCommands.GET)) {
      return false;
    }
    const match = message.match(regexMoonpieGet);
    if (!match) {
      return false;
    }
    return { data: { userNameMoonpieDb: match[1] } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.GET,
  },
};

interface CommandDetectorSetData {
  operation: "+" | "-" | "=";
  setCount: number;
  userNameMoonpieDb: string;
}

/**
 * Set command: Set the moonpie count of someone (multiple operations available).
 */
export const commandSet: TwitchChatCommandHandler<
  CommandGenericDataMoonpieDbPath,
  CommandDetectorSetData
> = {
  createReply: async (
    client,
    channel,
    tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    const twitchBadgeLevel = parseTwitchBadgeLevel(tags);
    if (twitchBadgeLevel !== TwitchBadgeLevels.BROADCASTER) {
      const errorMessage = await messageParserById(
        moonpieUserPermissionError.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      throw Error(errorMessage);
    }
    const macros = new Map(globalMacros);
    macros.set(
      macroMoonpieUserSet.id,
      new Map([
        [MacroMoonpieUserSet.NAME, `${data.userNameMoonpieDb}`],
        [MacroMoonpieUserSet.SET_COUNT, `${data.setCount}`],
        [MacroMoonpieUserSet.SET_OPERATION, `${data.operation}`],
      ])
    );
    if (!Number.isInteger(data.setCount)) {
      const errorMessage = await messageParserById(
        moonpieUserSetNaNError.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
      throw Error(errorMessage);
    }

    // Check if a moonpie entry already exists
    if (
      !(await moonpieDb.existsName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      ))
    ) {
      macros.set(
        macroMoonpieUserNeverClaimed.id,
        new Map([
          [MacroMoonpieUserNeverClaimed.NAME, `${data.userNameMoonpieDb}`],
        ])
      );
      const errorMessage = await messageParserById(
        moonpieUserNeverClaimedError.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
      throw Error(errorMessage);
    }

    const moonpieEntry = await moonpieDb.getMoonpieName(
      data.moonpieDbPath,
      data.userNameMoonpieDb,
      logger
    );
    let newCount = moonpieEntry.count;
    switch (data.operation) {
      case "+":
        newCount += data.setCount;
        break;
      case "-":
        newCount -= data.setCount;
        break;
      case "=":
        newCount = data.setCount;
        break;
    }
    if (newCount < 0) {
      newCount = 0;
    }
    await moonpieDb.update(
      data.moonpieDbPath,
      {
        count: newCount,
        id: moonpieEntry.id,
        name: moonpieEntry.name,
        timestamp: moonpieEntry.timestamp,
      },
      logger
    );

    const currentMoonpieLeaderboardEntry =
      await moonpieDb.getMoonpieLeaderboardEntry(
        data.moonpieDbPath,
        moonpieEntry.id,
        logger
      );

    macros.set(
      macroMoonpieLeaderboardEntry.id,
      new Map([
        [MacroMoonpieLeaderboardEntry.NAME, `${data.userNameMoonpieDb}`],
        [MacroMoonpieLeaderboardEntry.COUNT, `${newCount}`],
        [
          MacroMoonpieLeaderboardEntry.RANK,
          `${currentMoonpieLeaderboardEntry.rank}`,
        ],
      ])
    );
    const message = await messageParserById(
      moonpieUserSet.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    const matchSet = message.match(regexMoonpieSet);
    if (matchSet && enabledCommands.includes(MoonpieCommands.SET)) {
      return {
        data: {
          operation: "=",
          setCount: parseInt(matchSet[2]),
          userNameMoonpieDb: matchSet[1],
        },
      };
    }
    const matchAdd = message.match(regexMoonpieAdd);
    if (matchAdd && enabledCommands.includes(MoonpieCommands.ADD)) {
      return {
        data: {
          operation: "+",
          setCount: parseInt(matchAdd[2]),
          userNameMoonpieDb: matchAdd[1],
        },
      };
    }
    const matchRemove = message.match(regexMoonpieRemove);
    if (matchRemove && enabledCommands.includes(MoonpieCommands.REMOVE)) {
      return {
        data: {
          operation: "-",
          setCount: parseInt(matchRemove[2]),
          userNameMoonpieDb: matchRemove[1],
        },
      };
    }
    return false;
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.SET,
  },
};

interface CommandDetectorDeleteData {
  userNameMoonpieDb: string;
}

/**
 * Delete command: Remove a moonpie database entry from the database.
 */
export const commandDelete: TwitchChatCommandHandler<
  CommandGenericDataMoonpieDbPath,
  CommandDetectorDeleteData
> = {
  createReply: async (
    client,
    channel,
    tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    const twitchBadgeLevel = parseTwitchBadgeLevel(tags);
    if (twitchBadgeLevel !== TwitchBadgeLevels.BROADCASTER) {
      const errorMessage = await messageParserById(
        moonpieUserPermissionError.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      throw Error(errorMessage);
    }

    // Check if a moonpie entry already exists
    if (
      !(await moonpieDb.existsName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      ))
    ) {
      const macros = new Map(globalMacros);
      macros.set(
        macroMoonpieUserNeverClaimed.id,
        new Map([
          [MacroMoonpieUserNeverClaimed.NAME, `${data.userNameMoonpieDb}`],
        ])
      );
      const errorMessage = await messageParserById(
        moonpieUserNeverClaimedError.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
      throw Error(errorMessage);
    }

    await moonpieDb.removeName(
      data.moonpieDbPath,
      data.userNameMoonpieDb,
      logger
    );

    const macros = new Map(globalMacros);
    macros.set(
      macroMoonpieUserDelete.id,
      new Map([[MacroMoonpieUserDelete.NAME, `${data.userNameMoonpieDb}`]])
    );
    const message = await messageParserById(
      moonpieUserDelete.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!enabledCommands.includes(MoonpieCommands.DELETE)) {
      return false;
    }
    const match = message.match(regexMoonpieDelete);
    if (!match) {
      return false;
    }
    return { data: { userNameMoonpieDb: match[1] } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.ABOUT,
  },
};
