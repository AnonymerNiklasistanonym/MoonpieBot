/**
 * Strings handling.
 */

// Local imports
import { createLogFunc } from "./logging";
import { customCommandsBroadcastsCommands } from "./strings/customCommandsBroadcasts/commands";
import { ENV_STRINGS_VARIABLE_PREFIX } from "./info/env";
import { general } from "./strings/general";
import { moonpieCommandReply } from "./strings/moonpie/commandReply";
import { moonpieCommands } from "./strings/moonpie/commands";
import { moonpieUser } from "./strings/moonpie/user";
import { osuBeatmapRequests } from "./strings/osu/beatmapRequest";
import { osuCommandReply } from "./strings/osu/commandReply";
import { osuCommands } from "./strings/osu/commands";
import { spotifyCommandReply } from "./strings/spotify/commandReply";
import { spotifyCommands } from "./strings/spotify/commands";
// Type imports
import type { Logger } from "winston";

/**
 * The global Strings data structure that maps from a unique string ID to a
 * string value that can be overridden.
 */
export type StringMap = Map<string, string>;

/**
 * The logging ID of this module.
 */
const LOG_ID = "strings";

/**
 * The data of a string entry (so that descriptions or other future data can be
 * stored).
 */
export interface StringEntry {
  /**
   * The default value.
   */
  default: string;
  /**
   * The unique ID of the string entry.
   */
  id: string;
}

/**
 * Generate a string list for fast usage in a map.
 *
 * @param stringEntries The string entries (with more information).
 * @returns The resulting array can be inserted into a map for easy setup.
 */
const generateStringList = (
  ...stringEntries: StringEntry[]
): [string, string][] => {
  const mappedStringEntries = stringEntries.map<[string, string]>((a) => [
    a.id,
    a.default,
  ]);
  // Check for duplicated IDs
  mappedStringEntries.forEach((value, index, array) => {
    if (array.findIndex((a) => a[0] === value[0]) !== index) {
      throw Error(`The string list contained the ID "${value[0]}" twice`);
    }
  });
  return mappedStringEntries;
};

/**
 * The default values for all strings.
 */
export const defaultStringMap: StringMap = new Map([
  ...generateStringList(
    ...customCommandsBroadcastsCommands,
    ...general,
    ...moonpieCommandReply,
    ...moonpieCommands,
    ...moonpieUser,
    ...osuBeatmapRequests,
    ...osuCommandReply,
    ...osuCommands,
    ...spotifyCommandReply,
    ...spotifyCommands
  ),
]);

/**
 * Update the strings map with environment variable strings.
 *
 * @param strings The current string map.
 * @param logger The global logger.
 * @returns The updated strings map.
 */
export const updateStringsMapWithCustomEnvStrings = (
  strings: StringMap = new Map(defaultStringMap),
  logger: Logger
): StringMap => {
  const logStrings = createLogFunc(
    logger,
    LOG_ID,
    "update_strings_with_custom_env_strings"
  );

  let foundCustomStringsCounter = 0;
  let foundCustomNonDefaultStringsCounter = 0;
  // First check for the default string entries
  for (const [key] of defaultStringMap.entries()) {
    const envValue = process.env[`${ENV_STRINGS_VARIABLE_PREFIX}${key}`];
    if (envValue !== undefined && envValue.trim().length > 0) {
      strings.set(key, envValue);
      foundCustomStringsCounter++;
      logStrings.debug(`Found default custom string: ${key}=${envValue}`);
    }
  }
  // Now check for custom strings
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith(ENV_STRINGS_VARIABLE_PREFIX) &&
      strings.get(key.slice(ENV_STRINGS_VARIABLE_PREFIX.length)) === undefined
    ) {
      // eslint-disable-next-line security/detect-object-injection
      const envValue = process.env[key];
      if (envValue !== undefined && envValue.trim().length > 0) {
        strings.set(key.slice(ENV_STRINGS_VARIABLE_PREFIX.length), envValue);
        foundCustomNonDefaultStringsCounter++;
        logStrings.debug(`Found non-default custom string: ${key}=${envValue}`);
      }
    }
  });

  if (foundCustomStringsCounter > 0) {
    logStrings.info(
      `Found ${foundCustomStringsCounter} default custom string${
        foundCustomStringsCounter > 1 ? "s" : ""
      }`
    );
  }
  if (foundCustomNonDefaultStringsCounter > 0) {
    logStrings.info(
      `Found ${foundCustomNonDefaultStringsCounter} non-default custom string${
        foundCustomNonDefaultStringsCounter > 1 ? "s" : ""
      }`
    );
  }
  return strings;
};
