// Package imports
import cron from "node-cron";
// Local imports
import { fileExists, readJsonFile } from "../other/fileOperations";
import { createLogFunc, typeGuardLog } from "../logging";
import { logTwitchMessageBroadcast } from "../twitch";
import { messageParser } from "../messageParser";
// Type imports
import type { Macros, Plugins } from "../messageParser";
import type { Client } from "tmi.js";
import type { CustomJson } from "./createExampleFiles";
import type { LogFunc } from "../logging";
import type { Logger } from "winston";
import type { Strings } from "../strings";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_CUSTOM_TIMER = "custom_timer";

/**
 * Represents a custom timer.
 */
export interface CustomTimer {
  /** ID of the timer. */
  id: string;
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
 * Structured, serializable data object that contains all information about
 * custom timers.
 */
export interface CustomTimersJson extends CustomJson {
  /** All custom timers. */
  timers: CustomTimer[];
}

/**
 * Type guard for CustomTimer objects.
 *
 * @param arg Possible CustomTimer object.
 * @param logger Optional logger for more detailed analysis.
 * @returns True if the object can be used as CustomTimer.
 */
export const isCustomTimer = (
  arg: CustomTimer,
  logger?: Logger
): arg is CustomTimer => {
  let logFunc: LogFunc | undefined;
  if (logger) {
    logFunc = createLogFunc(logger, LOG_ID_MODULE_CUSTOM_TIMER, {
      subsection: "is_custom_timer",
    });
  }
  if (typeof arg !== "object") {
    logFunc?.warn(typeGuardLog("not an object", arg));
    return false;
  }
  if (typeof arg.id !== "string") {
    logFunc?.warn(typeGuardLog("'id' != string", arg.id));
    return false;
  }
  if (!Array.isArray(arg.channels)) {
    logFunc?.warn(typeGuardLog("'channels' != array", arg.channels));
    return false;
  }
  if (
    !arg.channels.every((a, index) => {
      if (typeof a !== "string") {
        logFunc?.warn(typeGuardLog(`'channels'[${index}] != string`, a));
        return false;
      }
      return true;
    })
  ) {
    return false;
  }
  if (typeof arg.message !== "string") {
    logFunc?.warn(typeGuardLog("'message' != string", arg.message));
    return false;
  }
  if (typeof arg.cronString !== "string") {
    logFunc?.warn(typeGuardLog("'cronString' != string", arg.cronString));
    return false;
  }
  return true;
};

/**
 * Type guard for CustomTimersJson objects.
 *
 * @param arg Possible CustomTimersJson object.
 * @param logger Optional logger for more detailed analysis.
 * @returns True if the object can be used as CustomTimersJson.
 */
export const isCustomTimersJson = (
  arg: CustomTimersJson,
  logger?: Logger
): arg is CustomTimersJson => {
  let logFunc: LogFunc | undefined;
  if (logger) {
    logFunc = createLogFunc(logger, LOG_ID_MODULE_CUSTOM_TIMER, {
      subsection: "is_custom_timers_json",
    });
  }
  if (typeof arg !== "object") {
    logFunc?.warn(typeGuardLog("not an object", arg));
    return false;
  }
  if (typeof arg.$schema !== "string" && typeof arg.$schema !== "undefined") {
    logFunc?.warn(typeGuardLog("'$schema' != string/undefined", arg.$schema));
    return false;
  }
  if (!Array.isArray(arg.timers)) {
    logFunc?.warn(typeGuardLog("'timers' != array", arg.timers));
    return false;
  }
  if (
    !arg.timers
      .map((a, index) => {
        if (!isCustomTimer(a, logger)) {
          logFunc?.warn(typeGuardLog(`'timers'[${index}] != CustomTimer`, a));
          return false;
        }
        return true;
      })
      .every(Boolean)
  ) {
    return false;
  }
  return true;
};

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
        .then((parsedMessage) => client.say(`#${channel}`, parsedMessage))
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
  const customTimers: CustomTimer[] = [];
  const loggerCustomTimers = createLogFunc(logger, "custom_timer");

  if (await fileExists(filePath)) {
    loggerCustomTimers.info("Found custom timers file");
    const data = await readJsonFile<CustomTimersJson>(filePath);
    if (!isCustomTimersJson(data, logger)) {
      throw Error(
        `Loaded custom timers file '${filePath}' does not match its definition`
      );
    }
    const newCustomTimers = data.timers;
    for (const newCustomTimer of newCustomTimers) {
      loggerCustomTimers.info(
        `Add custom timer '${newCustomTimer.id}': '${newCustomTimer.message}' [${newCustomTimer.cronString}]`
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
