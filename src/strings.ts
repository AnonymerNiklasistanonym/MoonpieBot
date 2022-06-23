/**
 * Strings handling.
 */

import { Logger } from "winston";
import { moonpieCommandReply } from "./strings/moonpie";
import { osuBeatmapRequest } from "./strings/osu";
import { promises as fs } from "fs";

/**
 * The default values for all strings.
 */
export const defaultStrings = new Map<string, string>([
  ...moonpieCommandReply,
  ...osuBeatmapRequest,
  [
    "OSU_NP_COMMAND_REPLY_STREAMCOMPANION",
    "@$(USER) Currently playing '%OSU_STREAMCOMPANION:TITLE%' from '%OSU_STREAMCOMPANION:ARTIST%' ['%OSU_STREAMCOMPANION:VERSION%'] TODO",
  ],
]);

export const updateStringsMapWithCustomEnvStrings = (
  strings: Map<string, string> = new Map(defaultStrings),
  logger: Logger
) => {
  let foundCustomStringsCounter = 0;
  for (const [key] of defaultStrings.entries()) {
    const envValue = process.env[`MOONPIE_CUSTOM_STRING_${key}`];
    if (envValue !== undefined && envValue.trim().length > 0) {
      strings.set(key, envValue);
      foundCustomStringsCounter++;
      logger.debug({
        message: `Found custom string: ${key}=${envValue}`,
        section: "strings",
      });
    }
  }
  if (foundCustomStringsCounter > 0) {
    logger.info({
      message: `Found ${foundCustomStringsCounter} custom string${
        foundCustomStringsCounter > 1 ? "s" : ""
      }`,
      section: "strings",
    });
  }
  return strings;
};

export const writeStringsVariableDocumentation = async (path: string) => {
  let data =
    "# This is a list of all possible custom strings that can be overridden:\n\n";

  for (const [key, defaultValue] of defaultStrings.entries()) {
    if (defaultValue.endsWith(" ") || defaultValue.startsWith(" ")) {
      data += `#MOONPIE_CUSTOM_STRING_${key}="${defaultValue}"`;
    } else {
      data += `#MOONPIE_CUSTOM_STRING_${key}=${defaultValue}`;
    }
    data += `\n`;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, data);
};
