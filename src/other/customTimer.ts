import cron from "node-cron";
import { loggerCommand } from "../commands/commandHelper";
import { parseMessage } from "./parseMessage";
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
      parseMessage(message, [message], 0, "<not_available>", twitchApiClient)
        .then((parsedMessage) => client.say(channel, parsedMessage))
        .then((sentMessage) => {
          loggerCommand(
            logger,
            `Successfully sent timer message: '${JSON.stringify(sentMessage)}'`,
            { commandId: "!timer" }
          );
        })
        .catch(logger.error);
    }
  });
};

export const removeTimer = (cronTask: cron.ScheduledTask, logger: Logger) => {
  cronTask.stop();
  logger.debug(`Timer was stopped`);
};
