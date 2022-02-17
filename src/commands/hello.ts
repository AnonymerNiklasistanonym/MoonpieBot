/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * Reply to a hello command from a user
 *
 * @param client Twitch client connection
 * @param channel Name of the channel where the reply should be written
 * @param username Name of the user
 * @param logger Global logger
 */
export const commandHello = async (
  client: Client,
  channel: string,
  username: string | undefined,
  messageId: string | undefined,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw Error(`Unable to reply to message since ${messageId} is undefined!`);
  }
  if (username === undefined) {
    throw Error(
      `Unable to reply to message ${messageId} since the username is undefined!`
    );
  }

  const message = `@${username} Yo what's up lunepiHeart marinHey`;
  const sentMessage = await client.say(channel, message);
  logger.info(
    `!hello: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};
