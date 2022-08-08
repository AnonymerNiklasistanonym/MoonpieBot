// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntryId,
} from "../../messageParser/macros/moonpie";
import {
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyLeaderboardPrefix,
} from "../../strings/moonpie/commandReply";
import { errorMessageEnabledCommandsUndefined } from "../../commands";
import { MAX_LENGTH_OF_A_TWITCH_MESSAGE } from "../../info/other";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
// Type imports
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";
import type { TwitchMessageCommandHandler } from "../../twitch";

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
export const commandLeaderboard: TwitchMessageCommandHandler<CommandGenericDataMoonpieDbPath> =
  {
    info: {
      id: MoonpieCommands.LEADERBOARD,
      groupId: LOG_ID_CHAT_HANDLER_MOONPIE,
    },
    detect: (_tags, message, enabledCommands) => {
      if (enabledCommands === undefined) {
        throw errorMessageEnabledCommandsUndefined();
      }
      if (!message.match(regexMoonpieLeaderboard)) {
        return false;
      }
      if (!enabledCommands.includes(MoonpieCommands.LEADERBOARD)) {
        return false;
      }
      return { data: {} };
    },
    handle: async (
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
          macroMoonpieLeaderboardEntryId,
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
  };
