import { getVersion } from "../../version";
import { name, sourceCodeUrl } from "../../info";
import { errorMessageIdUndefined, loggerCommandReply } from "../../commands";
import { MoonpieCommands, MOONPIE_COMMAND_ID } from "../moonpie";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * About command: Send the name, version and source code link of the bot.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param logger Logger (used for global logs).
 */
export const commandAbout = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const message = `${name} ${getVersion()} (${sourceCodeUrl})`;
  const sentMessage = await client.say(channel, message);

  loggerCommandReply(
    logger,
    messageId,
    sentMessage,
    MOONPIE_COMMAND_ID,
    MoonpieCommands.ABOUT
  );
};
