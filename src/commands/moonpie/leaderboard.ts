import { moonpieDb } from "../../database/moonpieDb";
import {
  errorMessageIdUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { MoonpieCommands, LOG_ID_COMMAND_MOONPIE } from "../moonpie";
import {
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyLeaderboardPrefix,
} from "../../strings/moonpie/commandReply";
import { messageParser } from "../../messageParser";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../../strings";
import type { Macros, Plugins } from "../../messageParser";

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
    15,
    logger
  );

  let messageLeaderboard = await messageParser(
    globalStrings.get(moonpieCommandReplyLeaderboardPrefix.id),
    globalPlugins,
    globalMacros
  );
  const messageLeaderboardEntries = [];
  for (const moonpieEntry of moonpieEntries) {
    const macros = new Map(globalMacros);
    macros.set(
      "MOONPIE_LEADERBOARD_ENTRY",
      new Map([
        ["NAME", `${moonpieEntry.name}`],
        ["COUNT", `${moonpieEntry.count}`],
        ["RANK", `${moonpieEntry.rank}`],
      ])
    );
    messageLeaderboardEntries.push(
      await messageParser(
        globalStrings.get(moonpieCommandReplyLeaderboardEntry.id),
        globalPlugins,
        macros
      )
    );
  }
  messageLeaderboard += messageLeaderboardEntries.join(", ");

  // Slice the message if too long
  const message =
    messageLeaderboard.length > 499
      ? messageLeaderboard.slice(0, 449 - 3) + "..."
      : messageLeaderboard;
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    MoonpieCommands.LEADERBOARD
  );
};
