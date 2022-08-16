// Package imports
import cron from "node-cron";
// Local imports
import { createLogFunc, typeGuardLog } from "../logging";
import { fileExists, readJsonFile } from "../other/fileOperations";
import { logTwitchMessageBroadcast } from "../twitch";
import { messageParser } from "../messageParser";
// Type imports
import type { MacroMap, PluginMap } from "../messageParser";
import type { Client } from "tmi.js";
import type { CustomJson } from "./createExampleFiles";
import type { LogFunc } from "../logging";
import type { Logger } from "winston";
import type { StringMap } from "../strings";

/**
 * The logging ID of this module.
 */
const LOG_ID = "custom_timer";

/**
 * Represents a custom timer.
 */
export interface CustomTimer {
  /** The channels where the timer should be active. */
  channels: string[];
  /**
   * The cron(job) string.
   * For more information/help you can for example use this website: https://crontab.cronhub.io/.
   */
  cronString: string;
  /** ID of the timer. */
  id: string;
  /** The message that should be sent (will be parsed by the message parser). */
  message: string;
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
const isCustomTimer = (
  arg: CustomTimer,
  logger?: Logger
): arg is CustomTimer => {
  let logFunc: LogFunc | undefined;
  if (logger) {
    logFunc = createLogFunc(logger, LOG_ID, "is_custom_timer");
  }
  if (typeof arg !== "object") {
    logFunc?.warn(typeGuardLog("object", arg));
    return false;
  }
  if (typeof arg.id !== "string") {
    logFunc?.warn(typeGuardLog("string", arg.id, "id"));
    return false;
  }
  if (!Array.isArray(arg.channels)) {
    logFunc?.warn(typeGuardLog("array", arg.channels, "channels"));
    return false;
  }
  if (
    !arg.channels.every((a, index) => {
      if (typeof a !== "string") {
        logFunc?.warn(typeGuardLog("string", a, "channels", index));
        return false;
      }
      return true;
    })
  ) {
    return false;
  }
  if (typeof arg.message !== "string") {
    logFunc?.warn(typeGuardLog("string", arg.message, "message"));
    return false;
  }
  if (typeof arg.cronString !== "string") {
    logFunc?.warn(typeGuardLog("string", arg.cronString, "cronString"));
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
const isCustomTimersJson = (
  arg: CustomTimersJson,
  logger?: Logger
): arg is CustomTimersJson => {
  let logFunc: LogFunc | undefined;
  if (logger) {
    logFunc = createLogFunc(logger, LOG_ID, "is_custom_timers_json");
  }
  if (typeof arg !== "object") {
    logFunc?.warn(typeGuardLog("object", arg));
    return false;
  }
  if (typeof arg.$schema !== "string" && typeof arg.$schema !== "undefined") {
    logFunc?.warn(typeGuardLog("string/undefined", arg.$schema, "$schema"));
    return false;
  }
  if (!Array.isArray(arg.timers)) {
    logFunc?.warn(typeGuardLog("array", arg.timers, "timers"));
    return false;
  }
  if (
    !arg.timers
      .map((a, index) => {
        if (!isCustomTimer(a, logger)) {
          logFunc?.warn(typeGuardLog("CustomTimer", a, "timers", index));
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
  globalStrings: StringMap,
  globalPlugins: PluginMap,
  globalMacros: MacroMap,
  logger: Logger
): cron.ScheduledTask => {
  const logCustomTimer = createLogFunc(logger, LOG_ID, "register_timer");

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

/*
export const removeTimer = (
  cronTask: cron.ScheduledTask,
  logger: Logger
): void => {
  const logCustomTimer = createLogFunc(logger, LOG_ID, "remove_timer");

  cronTask.stop();
  logCustomTimer.debug("Timer was stopped");
};
*/

export const loadCustomTimersFromFile = async (
  filePath: string,
  logger: Logger
): Promise<CustomTimer[]> => {
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
        newCustomTimers.length === 1 ? "" : "s"
      }`
    );
    customTimers.push(...newCustomTimers);
  }

  return customTimers;
};
