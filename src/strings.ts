/**
 * Strings handling.
 */

// Local imports
import { createLogFunc } from "./logging";
import { ENV_STRINGS_VARIABLE_PREFIX } from "./info/env";
import { moonpieCommandReply } from "./strings/moonpie/commandReply";
import { moonpieCommands } from "./strings/moonpie/commands";
import { moonpieUser } from "./strings/moonpie/user";
import { osuBeatmapRequests } from "./strings/osu/beatmapRequest";
import { osuCommandReply } from "./strings/osu/commandReply";
import { spotifyCommandReply } from "./strings/spotify/commandReply";
// Type imports
import type { Logger } from "winston";

/**
 * The global Strings data structure that maps from a unique string ID to a
 * string value that can be overridden.
 */
export type Strings = Map<string, string>;

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_STRINGS = "strings";

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
export const generateStringList = (
  stringEntries: StringEntry[]
): [string, string][] => stringEntries.map((a) => [a.id, a.default]);

/**
 * The default values for all strings.
 */
export const defaultStrings: Strings = new Map([
  ...generateStringList(moonpieCommandReply),
  ...generateStringList(moonpieCommands),
  ...generateStringList(moonpieUser),
  ...generateStringList(osuBeatmapRequests),
  ...generateStringList(osuCommandReply),
  ...generateStringList(spotifyCommandReply),
]);

/**
 * Update the strings map with environment variable strings.
 *
 * @param strings The current string map.
 * @param logger The global logger.
 * @returns The updated strings map.
 */
export const updateStringsMapWithCustomEnvStrings = (
  strings: Strings = new Map(defaultStrings),
  logger: Logger
) => {
  const logStrings = createLogFunc(
    logger,
    LOG_ID_MODULE_STRINGS,
    "update_strings_with_custom_env_strings"
  );

  let foundCustomStringsCounter = 0;
  let foundCustomNonDefaultStringsCounter = 0;
  // First check for the default string entries
  for (const [key] of defaultStrings.entries()) {
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
        logStrings.info(`Found non-default custom string: ${key}=${envValue}`);
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
