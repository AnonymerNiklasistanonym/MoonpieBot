import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * NP (now playing) command: Send the map that is currently playing in osu
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param logger Logger (used for logging)
 */
export const commandNp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const mapTitle = "title";
  const mapArtist = "artist";
  const mapUrl = "url";

  const message = `Currently playing is ${mapTitle} by ${mapArtist} (${mapUrl})`;
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuNp" }
  );
};
