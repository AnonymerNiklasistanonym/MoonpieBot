/* eslint-disable prettier/prettier */
import { client as tmiClient, Client } from "tmi.js";
import { Logger } from "winston";

export const createTwitchConnection = (
  twitchName: string,
  twitchOAuthToken: string,
  twitchChannels: string[],
  logger: Logger,
): Client => {
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

  logger.info(`Create Twitch client for the account ${twitchName} in the channels: ${JSON.stringify(twitchChannels)}`);

  return client;
};
