import cron from "node-cron";
import { logTwitchMessageBroadcast } from "../logging";
import { messageParser } from "../messageParser";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Macros, Plugins } from "../messageParser";

export const registerTimer = (
  client: Client,
  channels: string[],
  message: string,
  cronString: string,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): cron.ScheduledTask => {
  if (!cron.validate(cronString)) {
    throw Error(`Cron string '${cronString}' not valid`);
  }
  logger.debug(`Schedule timer ${cronString}: "${message}"`);
  return cron.schedule(cronString, () => {
    logger.debug(`Timer triggered ${cronString}: "${message}"`);
    for (const channel of channels) {
      messageParser(message, globalPlugins, globalMacros)
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
