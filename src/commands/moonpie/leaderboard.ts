import { moonpieDb } from "../../database/moonpieDb";
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * Leaderboard: Send the moonpie count leaderboard list (top 15)
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param moonpieDbPath Database file path of the moonpie database
 * @param logger Logger (used for logging)
 */
export const commandLeaderboard = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
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
  const messageLeaderboard = moonpieEntries
    .map((a) => `${a.rank}. ${a.name} (${a.count})`)
    .join(", ");
  // Slice the message if too long
  const message =
    messageLeaderboard.length > 499
      ? messageLeaderboard.slice(0, 449 - 3) + "..."
      : messageLeaderboard;
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "moonpieLeaderboard" }
  );
};
