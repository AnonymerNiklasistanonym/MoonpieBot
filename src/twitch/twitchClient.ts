/*
 * Create Twitch Client/Connection.
 */

// Package imports
import { client as tmiClient } from "tmi.js";
// Local imports
import { createLogFunc } from "../logging";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID = "twitch";

/**
 * Errorcodes that can be attached to @CreateTwitchClientError.
 */
export enum CreateTwitchClientErrorCode {
  TWITCH_CHANNELS_EMPTY = "TWITCH_CHANNELS_EMPTY",
  TWITCH_CHANNELS_UNDEFINED = "TWITCH_CHANNELS_UNDEFINED",
  TWITCH_NAME_UNDEFINED = "TWITCH_NAME_UNDEFINED",
  TWITCH_OAUTH_TOKEN_UNDEFINED = "TWITCH_OAUTH_TOKEN_UNDEFINED",
}

/**
 * An error that should be thrown if there if a logic or internal error was
 * detected when creating a Twitch client.
 */
export class CreateTwitchClientError extends Error {
  public code: CreateTwitchClientErrorCode;
  constructor(message: string, code: CreateTwitchClientErrorCode) {
    super(message);
    this.code = code;
  }
}

/**
 * A list of all available channels that can be listened to by the Twitch client.
 */
export enum TwitchClientListener {
  /**
   * Triggers when the Twitch client was disconnected from Twitch.
   */
  CLIENT_CONNECTED_TO_TWITCH = "connected",
  /**
   * Triggers when the Twitch client was disconnected from Twitch.
   */
  CLIENT_CONNECTING_TO_TWITCH = "connecting",
  /**
   * Triggers when the Twitch client was disconnected from Twitch.
   */
  CLIENT_DISCONNECTED_FROM_TWITCH = "disconnected",
  /**
   * Triggers when a new message is being sent in a Twitch channel that is being listened to.
   */
  NEW_MESSAGE = "message",
  /**
   * Triggers when a Twitch user joins a Twitch channel that is being listened to.
   */
  NEW_REDEEM = "redeem",
  /**
   * Triggers when a Twitch user joins a Twitch channel that is being listened to.
   */
  USER_JOINED_CHANNEL = "join",
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
  const logTwitchClient = createLogFunc(logger, LOG_ID, "client");

  // Throw an error if Twitch name,token or channels were not defined or empty
  if (twitchName === undefined) {
    throw new CreateTwitchClientError(
      "Could not create Twitch client: twitchName was undefined",
      CreateTwitchClientErrorCode.TWITCH_NAME_UNDEFINED
    );
  }
  if (twitchOAuthToken === undefined) {
    throw new CreateTwitchClientError(
      "Could not create Twitch client: twitchOAuthToken was undefined",
      CreateTwitchClientErrorCode.TWITCH_OAUTH_TOKEN_UNDEFINED
    );
  }
  if (twitchChannels === undefined) {
    throw new CreateTwitchClientError(
      "Could not create Twitch client: twitchChannels was undefined",
      CreateTwitchClientErrorCode.TWITCH_CHANNELS_UNDEFINED
    );
  }
  if (twitchChannels.length === 0) {
    throw new CreateTwitchClientError(
      "Could not create Twitch client: twitchChannels list was empty",
      CreateTwitchClientErrorCode.TWITCH_CHANNELS_EMPTY
    );
  }

  logTwitchClient.info(
    `Create Twitch client for the account "${twitchName}" in the channels: ${twitchChannels
      .map((a) => `"${a}"`)
      .join(", ")}`
  );

  // Create Twitch client that can listen to all specified channels
  return new tmiClient({
    channels: twitchChannels,
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      password: twitchOAuthToken,
      username: twitchName,
    },
    logger: {
      error: (message) => logTwitchClient.error(Error(message)),
      // Only log Twitch messages if enabled for privacy reasons
      info: debug ? logTwitchClient.debug : () => undefined,
      warn: logTwitchClient.warn,
    },
    options: { debug },
  });
};
