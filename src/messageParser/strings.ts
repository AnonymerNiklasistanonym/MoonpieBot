/**
 * Strings handling.
 */

// Local imports
import { createLogFunc } from "../logging";
import { ENV_PREFIX_CUSTOM_STRINGS } from "../info/env";
// Type imports
import type { Logger } from "winston";

/**
 * The global Strings data structure that maps from a unique string ID to a
 * string value that can be overridden.
 */
export type StringMap = Map<string, StringMapEntry>;

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
   * Alternative string values.
   */
  alternatives?: string[];
  /**
   * The default value.
   */
  default: string;
  /**
   * The description of the string entry.
   */
  description?: string;
  /**
   * The unique ID of the string entry.
   */
  id: string;
}

/**
 * The data of a string entry stored in the string map.
 */
export interface StringMapEntry extends Omit<StringEntry, "id"> {
  /** This is a custom entry. */
  custom?: boolean;
  /** This entry was updated. */
  updated?: boolean;
}

/**
 * Generate a string list for fast usage in a map.
 *
 * @param stringEntries The string entries (with more information).
 * @returns The resulting array can be inserted into a map for easy setup.
 */
export const generateStringMap = (
  ...stringEntries: StringEntry[]
): StringMap => {
  const mappedStringEntries = stringEntries.map<[string, StringMapEntry]>(
    (a) => [a.id, a]
  );
  // Check for duplicated IDs
  mappedStringEntries.forEach((value, index, array) => {
    if (array.findIndex((a) => a[0] === value[0]) !== index) {
      throw Error(`The string list contained the ID "${value[0]}" twice`);
    }
  });
  return new Map(mappedStringEntries);
};

/**
 * Update the strings map with environment variable strings.
 *
 * @param strings The current string map.
 * @param logger The global logger.
 * @returns The updated strings map.
 */
export const updateStringsMapWithCustomEnvStrings = (
  strings: StringMap,
  logger: Logger
): StringMap => {
  const logStrings = createLogFunc(
    logger,
    LOG_ID,
    "update_strings_with_custom_env_strings"
  );

  const updatedStrings = new Map(strings);
  let foundCustomStringsCounter = 0;
  let foundCustomNonDefaultStringsCounter = 0;
  // First check for the default string entries
  for (const [key] of updatedStrings.entries()) {
    const envValue = process.env[`${ENV_PREFIX_CUSTOM_STRINGS}${key}`];
    if (envValue !== undefined && envValue.trim().length > 0) {
      // Update the default string if there is a new one
      updatedStrings.set(key, { default: envValue, updated: true });
      foundCustomStringsCounter++;
      logStrings.debug(`Found default custom string: ${key}=${envValue}`);
    }
  }
  // Now check for custom strings
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith(ENV_PREFIX_CUSTOM_STRINGS) &&
      updatedStrings.get(key.slice(ENV_PREFIX_CUSTOM_STRINGS.length)) ===
        undefined
    ) {
      // eslint-disable-next-line security/detect-object-injection
      const envValue = process.env[key];
      if (envValue !== undefined) {
        updatedStrings.set(key.slice(ENV_PREFIX_CUSTOM_STRINGS.length), {
          custom: true,
          default: envValue,
          updated: true,
        });
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
  return updatedStrings;
};
