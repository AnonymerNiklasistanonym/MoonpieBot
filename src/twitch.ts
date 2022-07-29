/*
 * Twitch Client/Connection
 */

import { client as tmiClient, Client } from "tmi.js";
// Type import
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_TWITCH = "twitch";

/**
 * Errorcodes that can be attached to @CreateTwitchClientError.
 */
export enum CreateTwitchClientErrorCode {
  TWITCH_NAME_UNDEFINED = "TWITCH_NAME_UNDEFINED",
  TWITCH_OAUTH_TOKEN_UNDEFINED = "TWITCH_OAUTH_TOKEN_UNDEFINED",
  TWITCH_CHANNELS_UNDEFINED = "TWITCH_CHANNELS_UNDEFINED",
  TWITCH_CHANNELS_EMPTY = "TWITCH_CHANNELS_EMPTY",
}

/**
 * Error that is thrown if something goes wrong with creating the Twitch client.
 */
export interface CreateTwitchClientError extends Error {
  code?: CreateTwitchClientErrorCode;
}

/**.
 * Create a Twitch client/connection.
 *
 * The twitch client can then listen to multiple events.
 *
 * ```mermaid
 * graph LR
 *   twitchClient -- on --> connecting & connected & disconnected & join & message;
 *   connecting --> a["client is connecting to Twitch<br>(address, port) => {}"];
 *   connected --> b["client is connecting to Twitch<br>(address, port) => {}"];
 *   disconnected --> c["client was disconnected from Twitch<br>(reason) => {}"];
 *   join --> d["client joined a channel on Twitch<br>(channel, username, self) => {}"];
 *   message --> e["a new message is being sent in a joined Twitch channel<br>(channel, tags, message, self) => {}"];
 * ```
 *
 * @param twitchName Name of the Twitch account that should be connected.
 * @param twitchOAuthToken The authorization token to the Twitch account.
 * @param twitchChannels The Twitch channels that should be connected to.
 * @param logger Logger (used for logging).
 * @param debug Print Twitch client debug output to the console.
 * @returns Twitch client.
 */
export const createTwitchClient = (
  twitchName: string | undefined,
  twitchOAuthToken: string | undefined,
  twitchChannels: string[] | undefined,
  debug = false,
  logger: Logger
): Client => {
  // Throw an error if Twitch name,token or channels were not defined or empty
  if (twitchName === undefined) {
    const error = Error(
      "Could not create Twitch client: twitchName was undefined"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_NAME_UNDEFINED;
    logger.error({
      message: error.message,
      section: LOG_ID_MODULE_TWITCH,
    });
    throw error;
  }
  if (twitchOAuthToken === undefined) {
    const error = Error(
      "Could not create Twitch client: twitchOAuthToken was undefined"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_OAUTH_TOKEN_UNDEFINED;
    logger.error({
      message: error.message,
      section: LOG_ID_MODULE_TWITCH,
    });
    throw error;
  }
  if (twitchChannels === undefined) {
    const error = Error(
      "Could not create Twitch client: twitchChannels was undefined"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_CHANNELS_UNDEFINED;
    logger.error({
      message: error.message,
      section: LOG_ID_MODULE_TWITCH,
    });
    throw error;
  }
  if (twitchChannels.length === 0) {
    const error = Error(
      "Could not create Twitch client: twitchChannels list was empty"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_CHANNELS_EMPTY;
    logger.error({
      message: error.message,
      section: LOG_ID_MODULE_TWITCH,
    });
    throw error;
  }

  logger.info({
    message: `Create Twitch client for the account "${twitchName}" in the channels: ${twitchChannels
      .map((a) => '"' + a + '"')
      .join(",")}`,
    section: LOG_ID_MODULE_TWITCH,
  });

  // Create Twitch client that can listen to all specified channels
  const client: Client = new tmiClient({
    options: { debug },
    connection: {
      secure: true,
      reconnect: true,
    },
    identity: {
      username: twitchName,
      password: twitchOAuthToken,
    },
    channels: twitchChannels,
  });

  return client;
};

/**
 * Additional information for Twitch logs.
 */
export interface LogTwitchMessageOptions {
  subsection?: string;
}

/**
 * Log a Twitch message.
 *
 * @param logger The global logger.
 * @param message The message to log.
 * @param options Additional information like a subsection.
 */
export const logTwitchMessage = (
  logger: Logger,
  message: string,
  options?: LogTwitchMessageOptions
) => {
  logger.log({
    level: "debug",
    message: message,
    section: "twitch_message",
    subsection: options?.subsection,
  });
};

/**
 * Log a Twitch message reply.
 *
 * @param logger The global logger.
 * @param messageId The ID of the message that is replied to.
 * @param sentMessage The sent message information.
 * @param replySourceId The ID of the reply source.
 */
export const logTwitchMessageReply = (
  logger: Logger,
  messageId: string,
  sentMessage: string[],
  replySourceId: string
) => {
  logTwitchMessage(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { subsection: replySourceId }
  );
};

/**
 * Log a Twitch broadcast message.
 *
 * @param logger The global logger.
 * @param sentMessage The sent message information.
 * @param broadcastSourceId The ID of the broadcast source.
 */
export const logTwitchMessageBroadcast = (
  logger: Logger,
  sentMessage: string[],
  broadcastSourceId: string
) => {
  logTwitchMessage(
    logger,
    `Successfully broadcasted: '${JSON.stringify(sentMessage)}'`,
    {
      subsection: broadcastSourceId,
    }
  );
};

/**
 * Log a detected command in a  Twitch message.
 *
 * @param logger The global logger.
 * @param messageId The ID of the message that is replied to.
 * @param message The message that something was detected in.
 * @param detectionReason What was detected.
 * @param detectorSourceId The ID of the detection source.
 */
export const logTwitchMessageDetected = (
  logger: Logger,
  messageId: string,
  message: string[],
  detectionReason: string,
  detectorSourceId: string
) => {
  logTwitchMessage(
    logger,
    `Detected ${detectionReason} in message ${messageId}: ${JSON.stringify(
      message
    )}`,
    { subsection: detectorSourceId }
  );
};
