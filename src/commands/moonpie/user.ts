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
import moonpieDb from "../../database/moonpieDb";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type {
  RegexMoonpieChatHandlerCommandUserAdd,
  RegexMoonpieChatHandlerCommandUserDelete,
  RegexMoonpieChatHandlerCommandUserGet,
  RegexMoonpieChatHandlerCommandUserRemove,
  RegexMoonpieChatHandlerCommandUserSet,
} from "../../info/regex";
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";

export type CommandGetCreateReplyInput = CommandGenericDataMoonpieDbPath;
export type CommandGetDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
export interface CommandGetDetectorOutput {
  userNameMoonpieDb: string;
}
export const commandGet: TwitchChatCommandHandler<
  CommandGetCreateReplyInput,
  CommandGetDetectorInput,
  CommandGetDetectorOutput
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
      await moonpieDb.requests.moonpie.existsEntryName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      )
    ) {
      const moonpieEntry = await moonpieDb.requests.moonpie.getEntryName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      );

      const currentMoonpieLeaderboardEntry =
        await moonpieDb.requests.moonpieLeaderboard.getEntry(
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
    const matchGroups = match.groups as
      | undefined
      | RegexMoonpieChatHandlerCommandUserGet;
    if (!matchGroups) {
      throw Error("RegexMoonpieChatHandlerCommandUserGet groups undefined");
    }
    return { data: { userNameMoonpieDb: matchGroups.userName } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.GET,
  },
};

export type CommandSetCreateReplyInput = CommandGenericDataMoonpieDbPath;
export type CommandSetDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
export interface CommandSetDetectorOutput {
  operation: "+" | "-" | "=";
  setCount: number;
  userNameMoonpieDb: string;
}
/**
 * Set command: Set the moonpie count of someone (multiple operations available).
 */
export const commandSet: TwitchChatCommandHandler<
  CommandSetCreateReplyInput,
  CommandSetDetectorInput,
  CommandSetDetectorOutput
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
      !(await moonpieDb.requests.moonpie.existsEntryName(
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

    const moonpieEntry = await moonpieDb.requests.moonpie.getEntryName(
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
    await moonpieDb.requests.moonpie.updateEntry(
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
      await moonpieDb.requests.moonpieLeaderboard.getEntry(
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
      const matchGroups = matchSet.groups as
        | undefined
        | RegexMoonpieChatHandlerCommandUserSet;
      if (!matchGroups) {
        throw Error("RegexMoonpieChatHandlerCommandUserSet groups undefined");
      }
      return {
        data: {
          operation: "=",
          setCount: parseInt(matchGroups.moonpieCountSet),
          userNameMoonpieDb: matchGroups.userName,
        },
      };
    }
    const matchAdd = message.match(regexMoonpieChatHandlerCommandUserAdd);
    if (matchAdd && data.enabledCommands.includes(MoonpieCommands.ADD)) {
      const matchGroups = matchAdd.groups as
        | undefined
        | RegexMoonpieChatHandlerCommandUserAdd;
      if (!matchGroups) {
        throw Error("RegexMoonpieChatHandlerCommandUserAdd groups undefined");
      }
      return {
        data: {
          operation: "+",
          setCount: parseInt(matchGroups.moonpieCountAdd),
          userNameMoonpieDb: matchGroups.userName,
        },
      };
    }
    const matchRemove = message.match(regexMoonpieChatHandlerCommandUserRemove);
    if (matchRemove && data.enabledCommands.includes(MoonpieCommands.REMOVE)) {
      const matchGroups = matchRemove.groups as
        | undefined
        | RegexMoonpieChatHandlerCommandUserRemove;
      if (!matchGroups) {
        throw Error(
          "RegexMoonpieChatHandlerCommandUserRemove groups undefined"
        );
      }
      return {
        data: {
          operation: "-",
          setCount: parseInt(matchGroups.moonpieCountRemove),
          userNameMoonpieDb: matchGroups.userName,
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

export type CommandDeleteCreateReplyInput = CommandGenericDataMoonpieDbPath;
export type CommandDeleteDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
export interface CommandDeleteDetectorOutput {
  userNameMoonpieDb: string;
}
/**
 * Delete command: Remove a moonpie database entry from the database.
 */
export const commandDelete: TwitchChatCommandHandler<
  CommandDeleteCreateReplyInput,
  CommandDeleteDetectorInput,
  CommandDeleteDetectorOutput
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
      !(await moonpieDb.requests.moonpie.existsEntryName(
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

    await moonpieDb.requests.moonpie.removeEntryName(
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
    const matchGroups = match.groups as
      | undefined
      | RegexMoonpieChatHandlerCommandUserDelete;
    if (!matchGroups) {
      throw Error("RegexMoonpieChatHandlerCommandUserDelete groups undefined");
    }
    return { data: { userNameMoonpieDb: matchGroups.userName } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.ABOUT,
  },
};
