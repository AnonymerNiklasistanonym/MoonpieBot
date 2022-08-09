/**
 * Strings handling.
 */

// Package imports
import { promises as fs } from "fs";
// Local imports
import {
  FileDocumentationPartType,
  generateFileDocumentation,
} from "./other/splitTextAtLength";
import { createLogFunc } from "./logging";
import { generatePluginAndMacroDocumentation } from "./messageParser";
import { genericStringSorter } from "./other/genericStringSorter";
import { moonpieCommandReply } from "./strings/moonpie/commandReply";
import { moonpieCommands } from "./strings/moonpie/commands";
import { moonpieUser } from "./strings/moonpie/user";
import { osuBeatmapRequests } from "./strings/osu/beatmapRequest";
import { osuCommandReply } from "./strings/osu/commandReply";
import { spotifyCommandReply } from "./strings/spotify/commandReply";
// Type imports
import type {
  FileDocumentationParts,
  FileDocumentationPartValue,
} from "./other/splitTextAtLength";
import type {
  MessageParserMacro,
  MessageParserMacroDocumentation,
} from "./messageParser/macros";
import type {
  MessageParserPlugin,
  MessageParserPluginInfo,
} from "./messageParser/plugins";
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

export const PREFIX_CUSTOM_STRING = "MOONPIE_CUSTOM_STRING_";

export const generateStringList = (stringEntries: StringEntry[]) => {
  const out: [string, string][] = [];
  for (const stringEntry of stringEntries) {
    out.push([stringEntry.id, stringEntry.default]);
  }
  return out;
};

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

export const updateStringsMapWithCustomEnvStrings = (
  strings: Strings = new Map(defaultStrings),
  logger: Logger
) => {
  const logStrings = createLogFunc(logger, LOG_ID_MODULE_STRINGS, {
    subsection: "update_strings_with_custom_env_strings",
  });

  let foundCustomStringsCounter = 0;
  let foundCustomNonDefaultStringsCounter = 0;
  // First check for the default string entries
  for (const [key] of defaultStrings.entries()) {
    const envValue = process.env[`${PREFIX_CUSTOM_STRING}${key}`];
    if (envValue !== undefined && envValue.trim().length > 0) {
      strings.set(key, envValue);
      foundCustomStringsCounter++;
      logStrings.debug(`Found default custom string: ${key}=${envValue}`);
    }
  }
  // Now check for custom strings
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith(PREFIX_CUSTOM_STRING) &&
      strings.get(key.slice(PREFIX_CUSTOM_STRING.length)) === undefined
    ) {
      // eslint-disable-next-line security/detect-object-injection
      const envValue = process.env[key];
      if (envValue !== undefined && envValue.trim().length > 0) {
        strings.set(key.slice(PREFIX_CUSTOM_STRING.length), envValue);
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

export const createStringsVariableDocumentation = async (
  path: string,
  strings: Strings,
  plugins?: MessageParserPlugin[],
  macros?: MessageParserMacro[],
  optionalPlugins?: MessageParserPluginInfo[],
  optionalMacros?: MessageParserMacroDocumentation[],
  logger?: Logger
) => {
  const data: FileDocumentationParts[] = [];
  data.push({
    type: FileDocumentationPartType.TEXT,
    content:
      "This program allows to customize certain strings listed in this file. " +
      "To use a customized value instead of the default one uncomment the line. " +
      "Additionally there are plugins and macros that help with adding logic:",
  });
  data.push({ type: FileDocumentationPartType.NEWLINE, count: 1 });
  if (plugins !== undefined && macros !== undefined && logger !== undefined) {
    const pluginsAndMacroDocumentation =
      await generatePluginAndMacroDocumentation(
        strings,
        plugins,
        macros,
        optionalPlugins,
        optionalMacros,
        logger
      );
    data.push(...pluginsAndMacroDocumentation);
    data.push({ type: FileDocumentationPartType.NEWLINE, count: 1 });
    data.push({
      type: FileDocumentationPartType.TEXT,
      content:
        "Sometimes there are additional plugins/macros like $(USER). " +
        "These plugins/macros can only be used when they are provided. " +
        "So be sure to compare the default values plugins/macros for them.",
    });
    data.push({ type: FileDocumentationPartType.NEWLINE, count: 1 });
  }
  data.push({
    type: FileDocumentationPartType.TEXT,
    content:
      "To use a customized value instead of the default one uncomment the line. " +
      `(The lines that start with ${PREFIX_CUSTOM_STRING})`,
  });
  data.push({ type: FileDocumentationPartType.NEWLINE, count: 1 });
  data.push({
    type: FileDocumentationPartType.TEXT,
    content:
      "You can also reference other strings via $[REFERENCE]. " +
      `This will then be replaced by the string saved in ${PREFIX_CUSTOM_STRING}REFERENCE.`,
  });
  data.push({ type: FileDocumentationPartType.NEWLINE, count: 1 });

  const dataDefaultStrings: FileDocumentationPartValue[] = [];
  for (const [key, defaultValue] of defaultStrings.entries()) {
    if (defaultValue.endsWith(" ") || defaultValue.startsWith(" ")) {
      dataDefaultStrings.push({
        type: FileDocumentationPartType.VALUE,
        value: `${PREFIX_CUSTOM_STRING}${key}="${defaultValue}"`,
        prefix: ">",
        description: undefined,
        isComment: true,
      });
    } else {
      dataDefaultStrings.push({
        type: FileDocumentationPartType.VALUE,
        value: `${PREFIX_CUSTOM_STRING}${key}=${defaultValue}`,
        prefix: ">",
        description: undefined,
        isComment: true,
      });
    }
  }
  data.push(
    ...dataDefaultStrings.sort((a, b) => genericStringSorter(a.value, b.value))
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, generateFileDocumentation(data));
};

export interface StringEntry {
  /**
   * The unique ID of the string entry.
   */
  id: string;
  /**
   * The default value.
   */
  default: string;
}
