// Package imports
import { promises as fs } from "fs";
// Local imports
import {
  fileDocumentationGenerator,
  FileDocumentationPartType,
} from "./fileDocumentationGenerator";
import { defaultStringMap } from "../info/strings";
import { ENV_PREFIX_CUSTOM_STRINGS } from "../info/env";
import { escapeStringIfWhiteSpace } from "../other/whiteSpaceChecker";
import { generatePluginAndMacroDocumentation } from "../documentation/messageParser";
// Type imports
import type {
  FileDocumentationParts,
  FileDocumentationPartText,
  FileDocumentationPartValue,
} from "./fileDocumentationGenerator";
import type {
  MessageParserMacro,
  MessageParserMacroDocumentation,
  MessageParserPlugin,
  MessageParserPluginInfo,
} from "../messageParser";
import type { Logger } from "winston";
import type { StringMap } from "../messageParser";

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
    text:
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
      text:
        "Sometimes there are additional plugins/macros like $(USER). " +
        "These plugins/macros can only be used when they are provided. " +
        "So be sure to compare the default values plugins/macros for them.",
      type: FileDocumentationPartType.TEXT,
    });
    data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  }
  data.push({
    text:
      "To use a customized value instead of the default one uncomment the line. " +
      `(The lines that start with ${ENV_PREFIX_CUSTOM_STRINGS})`,
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    text:
      "You can also reference other strings via $[REFERENCE]. " +
      `This will then be replaced by the string saved in ${ENV_PREFIX_CUSTOM_STRINGS}REFERENCE.`,
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });

  const dataDefaultStrings: (
    | FileDocumentationPartValue
    | FileDocumentationPartText
  )[] = [];
  const sortedDefaultStrings = new Map([...defaultStringMap.entries()].sort());
  for (const [key, stringEntry] of sortedDefaultStrings) {
    if (stringEntry.description !== undefined) {
      dataDefaultStrings.push({
        text: `> ${stringEntry.description}`,
        type: FileDocumentationPartType.TEXT,
      });
    }
    dataDefaultStrings.push({
      isComment: true,
      type: FileDocumentationPartType.VALUE,
      value: `${ENV_PREFIX_CUSTOM_STRINGS}${key}=${escapeStringIfWhiteSpace(
        stringEntry.default,
        { escapeCharacters: [["'", "\\'"]], surroundCharacter: "'" }
      )}`,
    });
    if (
      stringEntry.alternatives !== undefined &&
      stringEntry.alternatives.length > 0
    ) {
      dataDefaultStrings.push({
        text: "  Alternatives:",
        type: FileDocumentationPartType.TEXT,
      });
      for (const alternative of stringEntry.alternatives) {
        dataDefaultStrings.push({
          isComment: true,
          type: FileDocumentationPartType.VALUE,
          value: `  - ${escapeStringIfWhiteSpace(alternative, {
            escapeCharacters: [["'", "\\'"]],
            surroundCharacter: "'",
          })}`,
        });
      }
    }
  }
  data.push(...dataDefaultStrings);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, fileDocumentationGenerator(data));
};
