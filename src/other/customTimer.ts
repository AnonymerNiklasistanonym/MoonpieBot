import cron from "node-cron";
import { logTwitchMessageBroadcast } from "../twitch";
import { messageParser } from "../messageParser";
import { logMessage } from "../logging";
import { fileExists, readJsonFile } from "./fileOperations";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Macros, Plugins } from "../messageParser";
import type { Strings } from "../strings";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_CUSTOM_TIMER = "custom_timer";

export interface CustomTimerJson {
  name?: string;
  channels: string[];
  message: string;
  cronString: string;
}
export interface CustomTimerDataJson {
  $schema?: string;
  timers: CustomTimerJson[];
}

export const registerTimer = (
  client: Client,
  channels: string[],
  message: string,
  cronString: string,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): cron.ScheduledTask => {
  const logCustomTimer = logMessage(logger, LOG_ID_MODULE_CUSTOM_TIMER, {
    subsection: "register_timer",
  });

  if (!cron.validate(cronString)) {
    throw Error(`Cron string '${cronString}' not valid`);
  }
  logCustomTimer.debug(`Schedule timer ${cronString}: "${message}"`);
  return cron.schedule(cronString, () => {
    logCustomTimer.debug(`Timer triggered ${cronString}: "${message}"`);
    for (const channel of channels) {
      messageParser(message, globalStrings, globalPlugins, globalMacros, logger)
        .then((parsedMessage) => client.say(channel, parsedMessage))
        .then((sentMessage) => {
          logTwitchMessageBroadcast(logger, sentMessage, "timer");
        })
        .catch(logger.error);
    }
  });
};

export const removeTimer = (cronTask: cron.ScheduledTask, logger: Logger) => {
  const logCustomTimer = logMessage(logger, LOG_ID_MODULE_CUSTOM_TIMER, {
    subsection: "remove_timer",
  });

  cronTask.stop();
  logCustomTimer.debug(`Timer was stopped`);
};

export const loadCustomTimersFromFile = async (
  filePath: string,
  logger: Logger
) => {
  const customTimers: CustomTimerJson[] = [];
  const loggerCustomTimers = logMessage(logger, "custom_timer");

  if (await fileExists(filePath)) {
    loggerCustomTimers.info("Found custom timers file");
    const newCustomTimers = (await readJsonFile<CustomTimerDataJson>(filePath))
      .timers;
    for (const newCustomTimer of newCustomTimers) {
      loggerCustomTimers.info(
        `Add custom command ${
          newCustomTimer.name ? newCustomTimer.name : "no-name"
        }: ${newCustomTimer.message} [${newCustomTimer.cronString}]`
      );
    }
    customTimers.push(...newCustomTimers);
  }

  return customTimers;
};
