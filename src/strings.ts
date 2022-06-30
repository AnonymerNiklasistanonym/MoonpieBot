/**
 * Strings handling.
 */

import { moonpieCommandReply } from "./strings/moonpie/commandReply";
import { osuBeatmapRequests } from "./strings/osu/beatmapRequest";
import { promises as fs } from "fs";
import { generatePluginAndMacroDocumentation } from "./messageParser";
import { osuCommandReply } from "./strings/osu/commandReply";
import { spotifyCommandReply } from "./strings/spotify/commandReply";
import {
  FileDocumentationPartType,
  generateFileDocumentation,
} from "./other/splitTextAtLength";
import type { Logger } from "winston";
import type { MessageParserPlugin } from "./messageParser/plugins";
import type { MessageParserMacro } from "./messageParser/macros";
import type {
  FileDocumentationPartValue,
  FileDocumentationParts,
} from "./other/splitTextAtLength";

export type Strings = Map<string, string>;

export const PREFIX_CUSTOM_STRING = "MOONPIE_CUSTOM_STRING_";

/**
 * The default values for all strings.
 */
export const defaultStrings: Strings = new Map<string, string>([
  ...moonpieCommandReply,
  ...osuBeatmapRequests,
  ...osuCommandReply,
  ...spotifyCommandReply,
]);

export const updateStringsMapWithCustomEnvStrings = (
  strings: Map<string, string> = new Map(defaultStrings),
  logger: Logger
) => {
  let foundCustomStringsCounter = 0;
  let foundCustomNonDefaultStringsCounter = 0;
  // First check for the default string entries
  for (const [key] of defaultStrings.entries()) {
    const envValue = process.env[`${PREFIX_CUSTOM_STRING}${key}`];
    if (envValue !== undefined && envValue.trim().length > 0) {
      strings.set(key, envValue);
      foundCustomStringsCounter++;
      logger.debug({
        message: `Found default custom string: ${key}=${envValue}`,
        section: "strings",
      });
    }
  }
  // Now check for custom strings
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith(PREFIX_CUSTOM_STRING) &&
      strings.get(key) === undefined
    ) {
      // eslint-disable-next-line security/detect-object-injection
      const envValue = process.env[key];
      if (envValue !== undefined && envValue.trim().length > 0) {
        strings.set(key.slice(PREFIX_CUSTOM_STRING.length), envValue);
        foundCustomNonDefaultStringsCounter++;
        logger.info({
          message: `Found non-default custom string: ${key}=${envValue}`,
          section: "strings",
        });
      }
    }
  });

  if (foundCustomStringsCounter > 0) {
    logger.info({
      message: `Found ${foundCustomStringsCounter} default custom string${
        foundCustomStringsCounter > 1 ? "s" : ""
      }`,
      section: "strings",
    });
  }
  if (foundCustomNonDefaultStringsCounter > 0) {
    logger.info({
      message: `Found ${foundCustomNonDefaultStringsCounter} non-default custom string${
        foundCustomNonDefaultStringsCounter > 1 ? "s" : ""
      }`,
      section: "strings",
    });
  }
  return strings;
};

export const writeStringsVariableDocumentation = async (
  path: string,
  strings: Strings,
  plugins: MessageParserPlugin[] = [],
  macros: MessageParserMacro[] = [],
  logger: Logger
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
  const pluginsAndMacroDocumentation =
    await generatePluginAndMacroDocumentation(strings, plugins, macros, logger);
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
    ...dataDefaultStrings.sort((a, b) => {
      if (a.value === undefined || b.value === undefined) {
        return 0;
      }
      return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
    })
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, generateFileDocumentation(data));
};
