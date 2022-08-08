import {
  errorMessageIdUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
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
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
// Type imports
import type { Macros, Plugins } from "../../messageParser";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../../strings";

const NUMBER_OF_LEADERBOARD_ENTRIES_TO_FETCH = 15;
const MAX_LENGTH_OF_A_TWITCH_MESSAGE = 499;

/**
 * Leaderboard command: Reply with the moonpie count leaderboard list (top 15).
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param moonpieDbPath Database file path of the moonpie database.
 * @param logger Logger (used for global logs).
 */
export const commandLeaderboard = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const moonpieEntries = await moonpieDb.getMoonpieLeaderboard(
    moonpieDbPath,
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

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_CHAT_HANDLER_MOONPIE,
    MoonpieCommands.LEADERBOARD
  );
};
