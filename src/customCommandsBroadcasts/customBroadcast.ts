// Package imports
import cron, { ScheduledTask } from "node-cron";
// Local imports
import { createLogFunc } from "../logging";
import { logBroadcastedMessage } from "../chatMessageHandler";
import { messageParser } from "../messageParser";
// Type imports
import type { MacroMap, PluginMap } from "../messageParser";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { StringMap } from "../messageParser";

/**
 * The logging ID of this module.
 */
const LOG_ID = "custom_broadcast";

/**
 * Represents a custom broadcast.
 */
export interface CustomBroadcast {
  /**
   * The cron(job) string.
   * For more information/help you can for example use this website: https://crontab.cronhub.io/.
   */
  cronString: string;
  /** A description of the broadcast. */
  description?: string;
  /** ID of the timer. */
  id: string;
  /** The message that should be sent (will be parsed by the message parser). */
  message: string;
}

export const createBroadcastScheduledTask = (
  client: Client,
  channels: Readonly<string[]>,
  customBroadcast: CustomBroadcast,
  globalStrings: StringMap,
  globalPlugins: PluginMap,
  globalMacros: MacroMap,
  logger: Logger
): cron.ScheduledTask => {
  const logCustomTimer = createLogFunc(logger, LOG_ID, "create_broadcast");

  if (!cron.validate(customBroadcast.cronString)) {
    throw Error(`Cron string '${customBroadcast.cronString}' not valid`);
  }
  logCustomTimer.debug(`Create broadcast '${customBroadcast.id}'`);
  return cron.schedule(customBroadcast.cronString, () => {
    logCustomTimer.debug(
      `Broadcast '${customBroadcast.id}' was triggered (${customBroadcast.cronString})`
    );
    for (const channel of channels) {
      messageParser(
        customBroadcast.message,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      )
        .then((parsedMessage) => client.say(channel, parsedMessage))
        .then((sentMessage) => {
          logBroadcastedMessage(logger, sentMessage, "timer");
        })
        .catch(logger.error);
    }
  });
};

export const stopBroadcastScheduledTask = (
  cronTask: ScheduledTask,
  customBroadcastId: string,
  logger: Logger
): void => {
  const logCustomTimer = createLogFunc(logger, LOG_ID, "stop_broadcast");

  cronTask.stop();
  logCustomTimer.debug(`Broadcast '${customBroadcastId}' was stopped`);
};
