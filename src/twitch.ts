/* eslint-disable prettier/prettier */
import { client as tmiClient, Client } from "tmi.js";
import { Logger } from "winston";

export const createTwitchClient = (
  twitchName: string,
  twitchOAuthToken: string,
  twitchChannels: string[],
  logger: Logger,
): Client => {
  logger.log({
    level: "debug",
    message: `Create Twitch client for the account ${twitchName} in the channels: ${JSON.stringify(twitchChannels)}`,
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
