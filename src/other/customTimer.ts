import cron from "node-cron";
import { parseMessage } from "./parseMessage";
import { logTwitchMessageBroadcast } from "../logging";
// Type imports
import type { ApiClient } from "@twurple/api";
import type { Client } from "tmi.js";
import type { Logger } from "winston";

export const registerTimer = (
  client: Client,
  channels: string[],
  message: string,
  cronString: string,
  twitchApiClient: ApiClient | undefined,
  logger: Logger
): cron.ScheduledTask => {
  if (!cron.validate(cronString)) {
    throw Error(`Cron string '${cronString}' not valid`);
  }
  logger.debug(`Schedule timer ${cronString}: "${message}"`);
  return cron.schedule(cronString, () => {
    logger.debug(`Timer triggered ${cronString}: "${message}"`);
    for (const channel of channels) {
      parseMessage(
        message,
        [message],
        0,
        "<not_available>",
        twitchApiClient,
        undefined,
        channel
      )
        .then((parsedMessage) => client.say(channel, parsedMessage))
        .then((sentMessage) => {
          logTwitchMessageBroadcast(logger, sentMessage, "timer");
        })
        .catch(logger.error);
    }
  });
};

export const removeTimer = (cronTask: cron.ScheduledTask, logger: Logger) => {
  cronTask.stop();
  logger.debug(`Timer was stopped`);
};
