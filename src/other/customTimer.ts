import cron from "node-cron";
import { logTwitchMessageBroadcast } from "../twitch";
import { messageParser } from "../messageParser";
import { createLogFunc } from "../logging";
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

/**
 * Represents a custom timer.
 */
export interface CustomTimerJson {
  /** Name of the timer. */
  name?: string;
  /** The channels where the timer should be active. */
  channels: string[];
  /** The message that should be sent (will be parsed by the message parser). */
  message: string;
  /**
   * The cron(job) string.
   * For more information/help you can for example use this website: https://crontab.cronhub.io/.
   */
  cronString: string;
}

/**
 * Structured data object that contains all information about custom timers.
 */
export interface CustomTimerDataJson {
  /** Pointer to the schema against which this document should be validated (Schema URL/path). */
  $schema?: string;
  /** All custom timers. */
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
  const logCustomTimer = createLogFunc(logger, LOG_ID_MODULE_CUSTOM_TIMER, {
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
  const logCustomTimer = createLogFunc(logger, LOG_ID_MODULE_CUSTOM_TIMER, {
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
  const loggerCustomTimers = createLogFunc(logger, "custom_timer");

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
    loggerCustomTimers.info(
      `Added ${newCustomTimers.length} custom timer${
        newCustomTimers.length > 1 ? "s" : ""
      }`
    );
    customTimers.push(...newCustomTimers);
  }

  return customTimers;
};
