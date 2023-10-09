// Relative imports
import {
  generateMacroMapFromMacroGenerator,
  messageParserById,
} from "../../messageParser.mjs";
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/chatCommands.mjs";
import {
  macroMoonpieLeaderboard,
  macroMoonpieLeaderboardEntry,
} from "../../info/macros/moonpie.mjs";
import {
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyLeaderboardErrorNoEntriesFound,
  moonpieCommandReplyLeaderboardPrefix,
} from "../../info/strings/moonpie/commandReply.mjs";
import moonpieDb from "../../database/moonpieDb.mjs";
import { regexMoonpieChatHandlerCommandLeaderboard } from "../../info/regex.mjs";
import { TWITCH_MESSAGE_MAX_CHAR_LENGTH } from "../../twitch.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type { CommandMoonpieGenericDataMoonpieDbPath } from "../moonpie.mjs";
import type { RegexMoonpieChatHandlerCommandLeaderboard } from "../../info/regex.mjs";

const NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH = 10;

export interface CommandLeaderboardDetectorOutput {
  startingRank?: number;
}
/**
 * Leaderboard command: Reply with the moonpie count leaderboard list (top 15).
 */
export const commandLeaderboard: ChatMessageHandlerReplyCreator<
  CommandMoonpieGenericDataMoonpieDbPath,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandLeaderboardDetectorOutput
> = {
  createReply: async (_channel, _tags, data, logger) => {
    const moonpieEntries =
      await moonpieDb.requests.moonpieLeaderboard.getEntries(
        data.moonpieDbPath,
        NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH,
        data.startingRank,
        logger,
      );
    if (data.startingRank !== undefined && Number.isNaN(data.startingRank)) {
      throw Error(
        `Starting rank (${data.startingRank}) is not undefined and not a number`,
      );
    }
    if (moonpieEntries.length === 0) {
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(
          macroMoonpieLeaderboard,
          data.startingRank !== undefined
            ? { startingRank: data.startingRank }
            : {},
          logger,
        ),
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
        logger2,
      ) => {
        const mergedMacros = new Map([
          ...globalMacros,
          ...generateMacroMapFromMacroGenerator(
            macroMoonpieLeaderboard,
            data.startingRank !== undefined
              ? { startingRank: data.startingRank }
              : {},
            logger,
          ),
        ]);
        let messageLeaderboard = await messageParserById(
          moonpieCommandReplyLeaderboardPrefix.id,
          globalStrings,
          globalPlugins,
          mergedMacros,
          logger2,
        );
        const messageLeaderboardEntries = [];
        for (const moonpieEntry of moonpieEntries) {
          messageLeaderboardEntries.push(
            await messageParserById(
              moonpieCommandReplyLeaderboardEntry.id,
              globalStrings,
              globalPlugins,
              new Map([
                ...mergedMacros,
                ...generateMacroMapFromMacroGenerator(
                  macroMoonpieLeaderboardEntry,
                  {
                    count: moonpieEntry.count,
                    name: moonpieEntry.name,
                    rank: moonpieEntry.rank,
                  },
                  logger,
                ),
              ]),
              logger,
            ),
          );
        }
        messageLeaderboard += messageLeaderboardEntries.join(", ");

        // Slice the message if too long
        const message =
          messageLeaderboard.length > TWITCH_MESSAGE_MAX_CHAR_LENGTH
            ? messageLeaderboard.slice(
                0,
                TWITCH_MESSAGE_MAX_CHAR_LENGTH - "...".length,
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
    if (matchGroups?.startingRank) {
      return { data: { startingRank: parseInt(matchGroups.startingRank) } };
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.LEADERBOARD,
  },
};
