// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
} from "../../messageParser/macros/moonpie";
import {
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyLeaderboardPrefix,
} from "../../strings/moonpie/commandReply";
import { MAX_LENGTH_OF_A_TWITCH_MESSAGE } from "../../info/other";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
// Type imports
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
} from "../../twitch";
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";

/**
 * Regex to recognize the `!moonpie leaderboard` command.
 *
 * @example
 * ```text
 * !moonpie leaderboard
 * ```
 */
export const regexMoonpieLeaderboard = /^\s*!moonpie\s+leaderboard\s*$/i;

const NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH = 15;

/**
 * Leaderboard command: Reply with the moonpie count leaderboard list (top 15).
 */
export const commandLeaderboard: TwitchChatCommandHandler<
  CommandGenericDataMoonpieDbPath,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn
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
      logger
    );

    let messageLeaderboard = await messageParserById(
      moonpieCommandReplyLeaderboardPrefix.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    const messageLeaderboardEntries = [];
    for (const moonpieEntry of moonpieEntries) {
      const macros = new Map(globalMacros);
      macros.set(
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
          macros,
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
    if (!message.match(regexMoonpieLeaderboard)) {
      return false;
    }
    if (!data.enabledCommands.includes(MoonpieCommands.LEADERBOARD)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.LEADERBOARD,
  },
};
