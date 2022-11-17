/**
 * Command line interface handling.
 */

// Local imports
import { cliOutputGenerator } from "./documentation/cliOutputGenerator";
import { genericStringSorter } from "./other/genericStringSorter";
// Type imports
import type {
  CliOutputElements,
  CliOutputOptions,
} from "./documentation/cliOutputGenerator";

/**
 * Generic information about the usage of the program.
 */
export interface CliUsageInformation {
  /** The signature of the usage option. */
  signature: string;
}

export enum CliOptionSignaturePartType {
  DIRECTORY,
  ENUM,
  FILE,
  TEXT,
}

export interface CliOptionSignaturePart {
  name: string;
  optional?: boolean;
  type: CliOptionSignaturePartType;
}
export interface CliOptionSignaturePartEnum extends CliOptionSignaturePart {
  enumValues: string[];
  type: CliOptionSignaturePartType.ENUM;
}
export interface CliOptionSignaturePartOther extends CliOptionSignaturePart {
  type:
    | CliOptionSignaturePartType.DIRECTORY
    | CliOptionSignaturePartType.FILE
    | CliOptionSignaturePartType.TEXT;
}

export type CliOptionSignatureParts =
  | CliOptionSignaturePartOther
  | CliOptionSignaturePartEnum;

export const cliOptionSignatureToString = (
  parts: CliOptionSignatureParts[]
): string =>
  parts
    .map((a) => {
      switch (a.type) {
        case CliOptionSignaturePartType.DIRECTORY:
          if (a.optional === true) {
            return `[${a.name.toUpperCase()}_DIR]`;
          }
          return `${a.name.toUpperCase()}_DIR`;
        case CliOptionSignaturePartType.ENUM:
          if (a.optional === true) {
            return `[${a.enumValues
              .map((b) => b.toUpperCase())
              .sort(genericStringSorter)
              .join("|")}]`;
          }
          return `${a.enumValues
            .map((b) => b.toUpperCase())
            .sort(genericStringSorter)
            .join("|")}`;
        case CliOptionSignaturePartType.FILE:
          if (a.optional === true) {
            return `[${a.name.toUpperCase()}_FILE]`;
          }
          return `${a.name.toUpperCase()}_FILE`;
        case CliOptionSignaturePartType.TEXT:
          if (a.optional === true) {
            return `[${a.name.toUpperCase()}]`;
          }
          return `${a.name.toUpperCase()}`;
      }
    })
    .join(" ");

/**
 * Generic information about a CLI option.
 */
export interface CliOptionInformation<NAME = string> {
  /** The default value. */
  default?: string | ((configDir: string) => string);
  /** The default value for example to display relative paths in 'default' but use absolute path as 'defaultValue'. */
  defaultValue?: string | ((configDir: string) => string);
  /** The description of the option. */
  description: string;
  /** Usage example. */
  example?: string;
  /** The name of the option. */
  name: NAME;
  /** The signature of the option. */
  signature?: CliOptionSignatureParts[];
}

export interface CliEnvVariableInformationSupportedValues {
  canBeJoinedAsList?: boolean;
  emptyListValue?: string;
  values: string[];
}

/**
 * Generic information about a CLI environment variable.
 */
export interface CliEnvVariableInformation<NAME = string, BLOCK = string> {
  /** The ENV variable block. */
  block: BLOCK;
  /** Censor variable per default to prevent leaks. */
  censor?: boolean;
  /** The default value. */
  default?: string | ((configDir: string) => string);
  /** The default value for example to display relative paths in 'default' but use absolute path as 'defaultValue'. */
  defaultValue?: string | ((configDir: string) => string);
  /** The description of the environment variable. */
  description: string;
  /** Usage example. */
  example?: string;
  /** Legacy names of ENV variable. */
  legacyNames?: string[];
  /** The name of the environment variable. */
  name: NAME;
  /** Is required to run the program. */
  required?: boolean;
  /** The supported values. */
  supportedValues?: CliEnvVariableInformationSupportedValues;
}

/**
 * Generic method to generate CLI help output.
 *
 * @param programName The name of the program.
 * @param cliUsagesInformation A list of all CLI usages.
 * @param cliOptionsInformation A list of all CLI options.
 * @param cliEnvVariableInformation A list of all ENV variables.
 * @param configDir The configuration directory.
 * @param outputOptions CLI output options.
 * @returns CLI help output string.
 */
export const cliHelpGenerator = (
  programName: string,
  cliUsagesInformation: CliUsageInformation[],
  cliOptionsInformation: CliOptionInformation[] = [],
  cliEnvVariableInformation: CliEnvVariableInformation[] = [],
  configDir: string,
  outputOptions: CliOutputOptions = {}
): string => {
  const helpOutput: CliOutputElements[] = [];

  // Add usage information
  if (cliUsagesInformation.length === 0) {
    helpOutput.push({
      elements: [{ content: programName }],
      title: "Usage",
      type: "list",
    });
  } else {
    helpOutput.push({
      elements: cliUsagesInformation.map((a) => ({
        content: `${programName}${a.signature.length > 0 ? " " : ""}${
          a.signature
        }`,
      })),
      title: "Usage",
      type: "list",
    });
  }

  // Add options
  if (cliOptionsInformation.length > 0) {
    helpOutput.push({ content: "", type: "text" });
    helpOutput.push({
      elements: cliOptionsInformation.map((a) => {
        let description = a.description;
        let content = a.name;
        if (a.signature !== undefined) {
          content += ` ${cliOptionSignatureToString(a.signature)}`;
        }
        if (a.default) {
          description += `\nDefault: '${
            typeof a.default === "function" ? a.default(configDir) : a.default
          }'`;
        }
        if (a.example) {
          description += `\nExample: '${a.example}'`;
        }
        return {
          content,
          description,
        };
      }),
      title: "Options",
      type: "list",
    });
  }

  // Add environment variables
  if (cliEnvVariableInformation.length > 0) {
    helpOutput.push({ content: "", type: "text" });
    helpOutput.push({
      elements: cliEnvVariableInformation.map((a) => {
        let content = a.name;
        if (a.default) {
          content += `=${
            typeof a.default === "function" ? a.default(configDir) : a.default
          }`;
        }
        let description = a.description;
        if (a.example) {
          description += `\nExample: '${a.example}'`;
        }
        if (
          a.supportedValues !== undefined &&
          a.supportedValues.values.length > 0
        ) {
          if (a.supportedValues.canBeJoinedAsList === true) {
            description += `\nSupported list values: ${a.supportedValues.values
              .map((b) => `'${b}'`)
              .join(", ")}`;
            if (a.supportedValues.emptyListValue) {
              description += ` (empty list value: '${a.supportedValues.emptyListValue}')`;
            }
          } else {
            description += `\nSupported values: ${a.supportedValues.values
              .map((b) => `'${b}'`)
              .join(", ")}`;
          }
        }
        return {
          content,
          description,
        };
      }),
      title: "Environment variables",
      type: "list",
    });
  }

  return cliOutputGenerator(helpOutput, outputOptions);
};
