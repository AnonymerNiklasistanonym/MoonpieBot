// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  macroMoonpieLeaderboardEntry,
  macroMoonpieUser,
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
import {
  regexMoonpieChatHandlerCommandUserAdd,
  regexMoonpieChatHandlerCommandUserDelete,
  regexMoonpieChatHandlerCommandUserGet,
  regexMoonpieChatHandlerCommandUserRemove,
  regexMoonpieChatHandlerCommandUserSet,
} from "../../info/regex";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
// Type imports
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
} from "../../twitch";
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";

interface CommandDetectorGetData {
  userNameMoonpieDb: string;
}

export const commandGet: TwitchChatCommandHandler<
  CommandGenericDataMoonpieDbPath,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
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
        macroMoonpieUser.id,
        new Map(macroMoonpieUser.generate({ name: data.userNameMoonpieDb }))
      );
      macros.set(
        macroMoonpieLeaderboardEntry.id,
        new Map(
          macroMoonpieLeaderboardEntry.generate({
            count: currentMoonpieLeaderboardEntry.count,
            name: data.userNameMoonpieDb,
            rank: currentMoonpieLeaderboardEntry.rank,
          })
        )
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
        macroMoonpieUser.id,
        new Map(macroMoonpieUser.generate({ name: data.userNameMoonpieDb }))
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
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(MoonpieCommands.GET)) {
      return false;
    }
    const match = message.match(regexMoonpieChatHandlerCommandUserGet);
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
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
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
      macroMoonpieUser.id,
      new Map(
        macroMoonpieUser.generate({
          name: data.userNameMoonpieDb,
        })
      )
    );
    macros.set(
      macroMoonpieUserSet.id,
      new Map(
        macroMoonpieUserSet.generate({
          setCount: data.setCount,
          setOperation: data.operation,
        })
      )
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
        macroMoonpieUser.id,
        new Map(macroMoonpieUser.generate({ name: data.userNameMoonpieDb }))
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
      new Map(
        macroMoonpieLeaderboardEntry.generate({
          count: newCount,
          name: data.userNameMoonpieDb,
          rank: currentMoonpieLeaderboardEntry.rank,
        })
      )
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
  detect: (_tags, message, data) => {
    const matchSet = message.match(regexMoonpieChatHandlerCommandUserSet);
    if (matchSet && data.enabledCommands.includes(MoonpieCommands.SET)) {
      return {
        data: {
          operation: "=",
          setCount: parseInt(matchSet[2]),
          userNameMoonpieDb: matchSet[1],
        },
      };
    }
    const matchAdd = message.match(regexMoonpieChatHandlerCommandUserAdd);
    if (matchAdd && data.enabledCommands.includes(MoonpieCommands.ADD)) {
      return {
        data: {
          operation: "+",
          setCount: parseInt(matchAdd[2]),
          userNameMoonpieDb: matchAdd[1],
        },
      };
    }
    const matchRemove = message.match(regexMoonpieChatHandlerCommandUserRemove);
    if (matchRemove && data.enabledCommands.includes(MoonpieCommands.REMOVE)) {
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

interface CommandDetectorDeleteDataOut {
  userNameMoonpieDb: string;
}

/**
 * Delete command: Remove a moonpie database entry from the database.
 */
export const commandDelete: TwitchChatCommandHandler<
  CommandGenericDataMoonpieDbPath,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
  CommandDetectorDeleteDataOut
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
      macroMoonpieUser.id,
      new Map(macroMoonpieUser.generate({ name: data.userNameMoonpieDb }))
    );

    // Check if a moonpie entry already exists
    if (
      !(await moonpieDb.existsName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      ))
    ) {
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
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(MoonpieCommands.DELETE)) {
      return false;
    }
    const match = message.match(regexMoonpieChatHandlerCommandUserDelete);
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
