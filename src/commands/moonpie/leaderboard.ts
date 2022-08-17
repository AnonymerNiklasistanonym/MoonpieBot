// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  MacroMoonpieLeaderboard,
  macroMoonpieLeaderboard,
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
} from "../../messageParser/macros/moonpie";
import {
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyLeaderboardErrorNoEntriesFound,
  moonpieCommandReplyLeaderboardPrefix,
} from "../../strings/moonpie/commandReply";
import { MAX_LENGTH_OF_A_TWITCH_MESSAGE } from "../../info/other";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
import { regexMoonpieChatHandlerCommandLeaderboard } from "../../info/regex";
// Type imports
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
} from "../../twitch";
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";

const NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH = 10;

interface CommandLeaderboardDetectorDataOut {
  startingRank?: number;
}

/**
 * Leaderboard command: Reply with the moonpie count leaderboard list (top 15).
 */
export const commandLeaderboard: TwitchChatCommandHandler<
  CommandGenericDataMoonpieDbPath,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
  CommandLeaderboardDetectorDataOut
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
    const moonpieEntries = await moonpieDb.getMoonpieLeaderboard(
      data.moonpieDbPath,
      NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH,
      data.startingRank,
      logger
    );

    const macros = new Map(globalMacros);
    macros.set(
      macroMoonpieLeaderboard.id,
      new Map([
        [
          MacroMoonpieLeaderboard.STARTING_RANK,
          `${
            data.startingRank !== undefined ? data.startingRank : "undefined"
          }`,
        ],
      ])
    );

    if (moonpieEntries.length === 0) {
      const errorMessage = await messageParserById(
        moonpieCommandReplyLeaderboardErrorNoEntriesFound.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
      throw Error(errorMessage);
    }

    let messageLeaderboard = await messageParserById(
      moonpieCommandReplyLeaderboardPrefix.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
    const messageLeaderboardEntries = [];
    for (const moonpieEntry of moonpieEntries) {
      const macrosLeaderboardEntry = new Map(macros);
      macrosLeaderboardEntry.set(
        macroMoonpieLeaderboardEntry.id,
        new Map([
          [MacroMoonpieLeaderboardEntry.NAME, `${moonpieEntry.name}`],
          [MacroMoonpieLeaderboardEntry.COUNT, `${moonpieEntry.count}`],
          [MacroMoonpieLeaderboardEntry.RANK, `${moonpieEntry.rank}`],
        ])
      );
      messageLeaderboardEntries.push(
        await messageParserById(
          moonpieCommandReplyLeaderboardEntry.id,
          globalStrings,
          globalPlugins,
          macrosLeaderboardEntry,
          logger
        )
      );
    }
    messageLeaderboard += messageLeaderboardEntries.join(", ");

    // Slice the message if too long
    const message =
      messageLeaderboard.length > MAX_LENGTH_OF_A_TWITCH_MESSAGE
        ? messageLeaderboard.slice(
            0,
            MAX_LENGTH_OF_A_TWITCH_MESSAGE - "...".length
          ) + "..."
        : messageLeaderboard;
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    const match = message.match(regexMoonpieChatHandlerCommandLeaderboard);
    if (!match) {
      return false;
    }
    if (!data.enabledCommands.includes(MoonpieCommands.LEADERBOARD)) {
      return false;
    }
    return {
      data: { startingRank: match[1] ? parseInt(match[1]) : undefined },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.LEADERBOARD,
  },
};
