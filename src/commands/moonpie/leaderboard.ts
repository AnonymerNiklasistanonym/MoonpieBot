// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  macroMoonpieLeaderboard,
  macroMoonpieLeaderboardEntry,
} from "../../messageParser/macros/moonpie";
import {
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyLeaderboardErrorNoEntriesFound,
  moonpieCommandReplyLeaderboardPrefix,
} from "../../strings/moonpie/commandReply";
import { MAX_LENGTH_OF_A_TWITCH_MESSAGE } from "../../info/other";
import { messageParserById } from "../../messageParser";
import moonpieDb from "../../database/moonpieDb";
import { regexMoonpieChatHandlerCommandLeaderboard } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";
import type { MacroMap } from "../../messageParser";
import type { RegexMoonpieChatHandlerCommandLeaderboard } from "../../info/regex";

const NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH = 10;

export type CommandLeaderboardCreateReplyInput =
  CommandGenericDataMoonpieDbPath;
export type CommandLeaderboardDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
export interface CommandLeaderboardDetectorOutput {
  startingRank?: number;
}
/**
 * Leaderboard command: Reply with the moonpie count leaderboard list (top 15).
 */
export const commandLeaderboard: TwitchChatCommandHandler<
  CommandLeaderboardCreateReplyInput,
  CommandLeaderboardDetectorInput,
  CommandLeaderboardDetectorOutput
> = {
  createReply: async (_channel, _tags, data, logger) => {
    const moonpieEntries =
      await moonpieDb.requests.moonpieLeaderboard.getEntries(
        data.moonpieDbPath,
        NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH,
        data.startingRank,
        logger
      );

    const macros: MacroMap = new Map();
    macros.set(
      macroMoonpieLeaderboard.id,
      new Map(
        macroMoonpieLeaderboard.generate({ startingRank: data.startingRank })
      )
    );

    if (moonpieEntries.length === 0) {
      return {
        additionalMacros: macros,
        isError: true,
        messageId: moonpieCommandReplyLeaderboardErrorNoEntriesFound.id,
      };
    }

    // TODO Think about a better implementation
    return {
      messageId: async (
        globalStrings,
        globalPlugins,
        globalMacros,
        logger2
      ) => {
        const mergedMacros = new Map([...globalMacros, ...macros]);
        let messageLeaderboard = await messageParserById(
          moonpieCommandReplyLeaderboardPrefix.id,
          globalStrings,
          globalPlugins,
          mergedMacros,
          logger2
        );
        const messageLeaderboardEntries = [];
        for (const moonpieEntry of moonpieEntries) {
          const macrosLeaderboardEntry = new Map(mergedMacros);
          macrosLeaderboardEntry.set(
            macroMoonpieLeaderboardEntry.id,
            new Map(
              macroMoonpieLeaderboardEntry.generate({
                count: moonpieEntry.count,
                name: moonpieEntry.name,
                rank: moonpieEntry.rank,
              })
            )
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
        return message;
      },
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(MoonpieCommands.LEADERBOARD)) {
      return false;
    }
    const match = message.match(regexMoonpieChatHandlerCommandLeaderboard);
    if (!match) {
      return false;
    }
    const matchGroups: undefined | RegexMoonpieChatHandlerCommandLeaderboard =
      match.groups;
    let startingRank;
    if (matchGroups?.startingRank) {
      startingRank = parseInt(matchGroups.startingRank);
    }
    return { data: { startingRank } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.LEADERBOARD,
  },
};
