/* eslint-disable prettier/prettier */
import { client as tmiClient, Client } from "tmi.js";
import type { Logger } from "winston";

export enum CreateTwitchClientErrorCode {
  TWITCH_NAME_UNDEFINED = "TWITCH_NAME_UNDEFINED",
  TWITCH_OAUTH_TOKEN_UNDEFINED = "TWITCH_OAUTH_TOKEN_UNDEFINED",
  TWITCH_CHANNELS_UNDEFINED = "TWITCH_CHANNELS_UNDEFINED",
  TWITCH_CHANNELS_EMPTY = "TWITCH_CHANNELS_EMPTY",
}

export interface CreateTwitchClientError extends Error {
  code?: CreateTwitchClientErrorCode
}

export const createTwitchClient = (
  twitchName: string | undefined,
  twitchOAuthToken: string | undefined,
  twitchChannels: string[] | undefined,
  logger: Logger,
): Client => {
  if (twitchName === undefined) {
    const error = Error("Could not create Twitch client: twitchName was undefined") as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_NAME_UNDEFINED;
    logger.error({
      level: "error",
      message: error.message,
      section: "twitch",
    });
    throw error;
  }
  if (twitchOAuthToken === undefined) {
    const error = Error("Could not create Twitch client: twitchOAuthToken was undefined") as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_OAUTH_TOKEN_UNDEFINED;
    logger.error({
      level: "error",
      message: error.message,
      section: "twitch",
    });
    throw error;
  }
  if (twitchChannels === undefined) {
    const error = Error("Could not create Twitch client: twitchChannels was undefined") as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_CHANNELS_UNDEFINED;
    logger.error({
      level: "error",
      message: error.message,
      section: "twitch",
    });
    throw error;
  }
  if (twitchChannels.length === 0) {
    const error = Error("Could not create Twitch client: twitchChannels list was empty") as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_CHANNELS_EMPTY;
    logger.error({
      level: "error",
      message: error.message,
      section: "twitch",
    });
    throw error;
  }

  logger.log({
    level: "info",
    message: `Create Twitch client for the account "${twitchName}" in the channels: ${twitchChannels.map(a => '"' + a + '"').join(",")}`,
    section: "twitch",
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const client: Client = new tmiClient({
    options: { debug: true },
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
