// Package imports
import { promises as fs } from "fs";
// Local imports
import { defaultStringMap } from "../strings";
import { ENV_STRINGS_VARIABLE_PREFIX } from "../info/env";
import { generateFileDocumentation } from "../other/splitTextAtLength";
import { generatePluginAndMacroDocumentation } from "../messageParser";
import { genericStringSorter } from "../other/genericStringSorter";
// Type imports
import {
  FileDocumentationPartType,
  FileDocumentationPartValue,
} from "../other/splitTextAtLength";
import type {
  MessageParserMacro,
  MessageParserMacroDocumentation,
} from "../messageParser/macros";
import type {
  MessageParserPlugin,
  MessageParserPluginInfo,
} from "../messageParser/plugins";
import type { FileDocumentationParts } from "../other/splitTextAtLength";
import type { Logger } from "winston";
import type { StringMap } from "../strings";

export const createStringsVariableDocumentation = async (
  path: string,
  strings: StringMap,
  plugins?: MessageParserPlugin[],
  macros?: MessageParserMacro[],
  optionalPlugins?: MessageParserPluginInfo[],
  optionalMacros?: MessageParserMacroDocumentation[],
  logger?: Logger
): Promise<void> => {
  const data: FileDocumentationParts[] = [];
  data.push({
    content:
      "This program allows to customize certain strings listed in this file. " +
      "To use a customized value instead of the default one uncomment the line. " +
      "Additionally there are plugins and macros that help with adding logic:",
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
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
    data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    data.push({
      content:
        "Sometimes there are additional plugins/macros like $(USER). " +
        "These plugins/macros can only be used when they are provided. " +
        "So be sure to compare the default values plugins/macros for them.",
      type: FileDocumentationPartType.TEXT,
    });
    data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  }
  data.push({
    content:
      "To use a customized value instead of the default one uncomment the line. " +
      `(The lines that start with ${ENV_STRINGS_VARIABLE_PREFIX})`,
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    content:
      "You can also reference other strings via $[REFERENCE]. " +
      `This will then be replaced by the string saved in ${ENV_STRINGS_VARIABLE_PREFIX}REFERENCE.`,
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });

  const dataDefaultStrings: FileDocumentationPartValue[] = [];
  for (const [key, defaultValue] of defaultStringMap.entries()) {
    if (defaultValue.endsWith(" ") || defaultValue.startsWith(" ")) {
      dataDefaultStrings.push({
        description: undefined,
        isComment: true,
        prefix: ">",
        type: FileDocumentationPartType.VALUE,
        value: `${ENV_STRINGS_VARIABLE_PREFIX}${key}="${defaultValue}"`,
      });
    } else {
      dataDefaultStrings.push({
        description: undefined,
        isComment: true,
        prefix: ">",
        type: FileDocumentationPartType.VALUE,
        value: `${ENV_STRINGS_VARIABLE_PREFIX}${key}=${defaultValue}`,
      });
    }
  }
  data.push(
    ...dataDefaultStrings.sort((a, b) => genericStringSorter(a.value, b.value))
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, generateFileDocumentation(data));
};
