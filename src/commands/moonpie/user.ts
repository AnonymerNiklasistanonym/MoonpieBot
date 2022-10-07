// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  macroMoonpieLeaderboardEntry,
  macroMoonpieUser,
  macroMoonpieUserSet,
} from "../../info/macros/moonpie";
import {
  moonpieUserDelete,
  moonpieUserGet,
  moonpieUserNeverClaimedError,
  moonpieUserSet,
  moonpieUserSetNaNError,
} from "../../info/strings/moonpie/user";
import {
  regexMoonpieChatHandlerCommandUserAdd,
  regexMoonpieChatHandlerCommandUserDelete,
  regexMoonpieChatHandlerCommandUserGet,
  regexMoonpieChatHandlerCommandUserRemove,
  regexMoonpieChatHandlerCommandUserSet,
} from "../../info/regex";
import { checkTwitchBadgeLevel } from "../../twitch";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import moonpieDb from "../../database/moonpieDb";
import { TwitchBadgeLevel } from "../../other/twitchBadgeParser";
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
import type { CommandMoonpieGenericDataMoonpieDbPath } from "../moonpie";

export interface CommandGetDetectorOutput {
  userNameMoonpieDb: string;
}
export const commandGet: TwitchChatCommandHandler<
  CommandMoonpieGenericDataMoonpieDbPath,
  CommandGenericDetectorInputEnabledCommands,
  CommandGetDetectorOutput
> = {
  createReply: async (_channel, _tags, data, logger) => {
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

      return {
        additionalMacros: new Map([
          ...generateMacroMapFromMacroGenerator(macroMoonpieUser, {
            name: data.userNameMoonpieDb,
          }),
          ...generateMacroMapFromMacroGenerator(macroMoonpieLeaderboardEntry, {
            count: currentMoonpieLeaderboardEntry.count,
            name: data.userNameMoonpieDb,
            rank: currentMoonpieLeaderboardEntry.rank,
          }),
        ]),
        messageId: moonpieUserGet.id,
      };
    } else {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(macroMoonpieUser, {
          name: data.userNameMoonpieDb,
        }),
        isError: true,
        messageId: moonpieUserNeverClaimedError.id,
      };
    }
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

export interface CommandSetDetectorOutput {
  operation: "+" | "-" | "=";
  setCount: number;
  userNameMoonpieDb: string;
}
/**
 * Set command: Set the moonpie count of someone (multiple operations available).
 */
export const commandSet: TwitchChatCommandHandler<
  CommandMoonpieGenericDataMoonpieDbPath,
  CommandGenericDetectorInputEnabledCommands,
  CommandSetDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.BROADCASTER
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    if (!Number.isInteger(data.setCount)) {
      return {
        additionalMacros: new Map([
          ...generateMacroMapFromMacroGenerator(macroMoonpieUser, {
            name: data.userNameMoonpieDb,
          }),
          ...generateMacroMapFromMacroGenerator(macroMoonpieUserSet, {
            setCount: data.setCount,
            setOperation: data.operation,
          }),
        ]),
        isError: true,
        messageId: moonpieUserSetNaNError.id,
      };
    }

    // Check if a moonpie entry already exists
    if (
      !(await moonpieDb.requests.moonpie.existsEntryName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      ))
    ) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(macroMoonpieUser, {
          name: data.userNameMoonpieDb,
        }),
        isError: true,
        messageId: moonpieUserNeverClaimedError.id,
      };
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

    return {
      additionalMacros: new Map([
        ...generateMacroMapFromMacroGenerator(macroMoonpieUser, {
          name: data.userNameMoonpieDb,
        }),
        ...generateMacroMapFromMacroGenerator(macroMoonpieUserSet, {
          setCount: data.setCount,
          setOperation: data.operation,
        }),
        ...generateMacroMapFromMacroGenerator(macroMoonpieLeaderboardEntry, {
          count: newCount,
          name: data.userNameMoonpieDb,
          rank: currentMoonpieLeaderboardEntry.rank,
        }),
      ]),
      messageId: moonpieUserSet.id,
    };
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

export interface CommandDeleteDetectorOutput {
  userNameMoonpieDb: string;
}
/**
 * Delete command: Remove a moonpie database entry from the database.
 */
export const commandDelete: TwitchChatCommandHandler<
  CommandMoonpieGenericDataMoonpieDbPath,
  CommandGenericDetectorInputEnabledCommands,
  CommandDeleteDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.BROADCASTER
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    // Check if a moonpie entry already exists
    if (
      !(await moonpieDb.requests.moonpie.existsEntryName(
        data.moonpieDbPath,
        data.userNameMoonpieDb,
        logger
      ))
    ) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(macroMoonpieUser, {
          name: data.userNameMoonpieDb,
        }),
        isError: true,
        messageId: moonpieUserNeverClaimedError.id,
      };
    }

    await moonpieDb.requests.moonpie.removeEntryName(
      data.moonpieDbPath,
      data.userNameMoonpieDb,
      logger
    );

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(macroMoonpieUser, {
        name: data.userNameMoonpieDb,
      }),
      messageId: moonpieUserDelete.id,
    };
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
    id: MoonpieCommands.DELETE,
  },
};
