/**
 * Strings handling.
 */

import { Logger } from "winston";
import { moonpieCommandReply } from "./strings/moonpie/commandReply";
import { osuBeatmapRequests } from "./strings/osu/beatmapRequest";
import { promises as fs } from "fs";
import { generatePluginAndMacroDocumentation } from "./messageParser";
import { MessageParserPlugin } from "./messageParser/plugins";
import { MessageParserMacro } from "./messageParser/macros";
import { osuCommandReply } from "./strings/osu/commandReply";

export type Strings = Map<string, string>;

export const PREFIX_CUSTOM_STRING = "MOONPIE_CUSTOM_STRING_";

/**
 * The default values for all strings.
 */
export const defaultStrings: Strings = new Map<string, string>([
  ...moonpieCommandReply,
  ...osuBeatmapRequests,
  ...osuCommandReply,
]);

export const updateStringsMapWithCustomEnvStrings = (
  strings: Map<string, string> = new Map(defaultStrings),
  logger: Logger
) => {
  let foundCustomStringsCounter = 0;
  for (const [key] of defaultStrings.entries()) {
    const envValue = process.env[`${PREFIX_CUSTOM_STRING}${key}`];
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

export const writeStringsVariableDocumentation = async (
  path: string,
  plugins: MessageParserPlugin[] = [],
  macros: MessageParserMacro[] = []
) => {
  let data =
    "# This program allows to customize certain strings listed in this file.\n";
  data +=
    "# To use a customized value instead of the default one uncomment the line.\n\n";
  data +=
    "# Additionally there are plugins and macros that help with adding logic:\n\n";

  const pluginsAndMacroDocumentation =
    await generatePluginAndMacroDocumentation(plugins, macros);
  data += `${pluginsAndMacroDocumentation}\n`;

  data += "# Sometimes there are additional plugins/macros like $(USER).\n";
  data += "# These plugins/macros can only be used when they are provided.\n";
  data +=
    "# So be sure to compare the default values plugins/macros for them.\n\n";
  data +=
    "# To use a customized value instead of the default one uncomment the line.\n";
  data += `# (The lines that start with ${PREFIX_CUSTOM_STRING})\n\n`;

  for (const [key, defaultValue] of defaultStrings.entries()) {
    if (defaultValue.endsWith(" ") || defaultValue.startsWith(" ")) {
      data += `#${PREFIX_CUSTOM_STRING}${key}="${defaultValue}"`;
    } else {
      data += `#${PREFIX_CUSTOM_STRING}${key}=${defaultValue}`;
    }
    data += `\n`;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, data);
};
