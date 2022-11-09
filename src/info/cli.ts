/**
 * CLI (Command Line Interface) information.
 */

// Package imports
import path from "path";
// Local imports
import { CliOptionSignaturePartType } from "../cli";
// Type imports
import type { CliOptionInformation } from "../cli";

/**
 * Supported CLI options.
 */
export enum CliOption {
  CONFIG_DIRECTORY = "--config-dir",
  CREATE_EXAMPLE_FILES = "--create-example-files",
  DISABLE_CENSORING = "--disable-censoring",
  EXPORT_DATA = "--export-data",
  EXPORT_DATA_JSON = "--export-data-json",
  HELP = "--help",
  VERSION = "--version",
}

/**
 * CLI options information.
 */
export const cliOptionsInformation: CliOptionInformation<CliOption>[] = [
  {
    default: (configDir) =>
      process.cwd() === path.resolve(configDir) ? "." + path.sep : configDir,
    defaultValue: (configDir) => path.resolve(configDir),
    description:
      "The directory that should contain all configurations and databases if not configured otherwise",
    name: CliOption.CONFIG_DIRECTORY,
    signature: [{ name: "config", type: CliOptionSignaturePartType.DIRECTORY }],
  },
  {
    description:
      "Disabling the censoring stops the censoring of private tokens which is helpful to debug if the inputs are read correctly but should otherwise be avoided",
    name: CliOption.DISABLE_CENSORING,
  },
  {
    description:
      "Creates example files (for custom commands and timers) in the specified configuration directory",
    name: CliOption.CREATE_EXAMPLE_FILES,
  },
  {
    description: "Exports certain data for backups",
    name: CliOption.EXPORT_DATA,
    signature: [
      {
        enumValues: [
          "moonpie",
          "custom_callbacks_broadcasts",
          "osu_requests_config",
          "env",
          "env_strings",
        ],
        name: "type",
        type: CliOptionSignaturePartType.ENUM,
      },
      {
        name: "output",
        optional: true,
        type: CliOptionSignaturePartType.FILE,
      },
    ],
  },
  {
    description: "Exports certain data for 3rd party support",
    name: CliOption.EXPORT_DATA_JSON,
    signature: [
      {
        enumValues: [
          "moonpie",
          "custom_callbacks_broadcasts",
          "osu_requests_config",
          "env",
          "env_strings",
        ],
        name: "type",
        type: CliOptionSignaturePartType.ENUM,
      },
      {
        name: "output",
        optional: true,
        type: CliOptionSignaturePartType.FILE,
      },
    ],
  },
  {
    description: "Get instructions on how to run and configure this program",
    name: CliOption.HELP,
  },
  {
    description: "Get the version of the program",
    name: CliOption.VERSION,
  },
];

export interface ParsedCliOptionsExportData {
  json?: boolean;
  outputFile?: string;
  type: string;
}

export interface ParsedCliOptions {
  createExampleFiles?: boolean;
  customConfigDir?: string;
  disableCensoring?: boolean;
  exportData?: ParsedCliOptionsExportData[];
  showHelp?: boolean;
  showVersion?: boolean;
}

export const parseCliOptions = (cliArgs: string[]): ParsedCliOptions => {
  // Exit early if an argument was found that terminates the program
  if (cliArgs.includes(CliOption.HELP)) {
    return { showHelp: true };
  }
  if (cliArgs.includes(CliOption.VERSION)) {
    return { showVersion: true };
  }

  const options: ParsedCliOptions = {};

  let lookingForConfigDir = false;
  let lookingForExportDataType = false;
  let lookingForExportDataJsonType = false;
  let lookingForExportDataOutputFile = false;
  let lookingForExportDataJsonOutputFile = false;
  for (const cliArg of cliArgs) {
    if (lookingForConfigDir) {
      options.customConfigDir = cliArg;
      lookingForConfigDir = false;
      continue;
    }
    if (lookingForExportDataType) {
      if (options.exportData === undefined) {
        options.exportData = [];
      }
      options.exportData?.push({
        type: cliArg,
      });
      lookingForExportDataType = false;
      lookingForExportDataOutputFile = true;
      continue;
    }
    if (lookingForExportDataJsonType) {
      if (options.exportData === undefined) {
        options.exportData = [];
      }
      options.exportData?.push({
        json: true,
        type: cliArg,
      });
      lookingForExportDataJsonType = false;
      lookingForExportDataJsonOutputFile = true;
      continue;
    }
    if (lookingForExportDataOutputFile || lookingForExportDataJsonOutputFile) {
      const lastExportDataEntry = options.exportData?.at(
        options.exportData.length - 1
      );
      if (lastExportDataEntry === undefined) {
        throw Error("Unexpected error export data entry not found");
      }
      lastExportDataEntry.outputFile = cliArg;
      lookingForExportDataOutputFile = false;
      lookingForExportDataJsonOutputFile = false;
      continue;
    }
    if (cliArg === CliOption.CONFIG_DIRECTORY) {
      lookingForConfigDir = true;
      continue;
    }
    if (cliArg === CliOption.CREATE_EXAMPLE_FILES) {
      options.createExampleFiles = true;
      continue;
    }
    if (cliArg === CliOption.DISABLE_CENSORING) {
      options.disableCensoring = true;
      continue;
    }
    if (cliArg === CliOption.EXPORT_DATA) {
      lookingForExportDataType = true;
      continue;
    }
    if (cliArg === CliOption.EXPORT_DATA_JSON) {
      lookingForExportDataJsonType = true;
      continue;
    }
    throw Error(`Found unknown CLI option '${cliArg}'`);
  }
  if (lookingForConfigDir) {
    throw Error(
      `Found '${CliOption.CONFIG_DIRECTORY}' but no config directory`
    );
  }
  if (lookingForExportDataType) {
    throw Error(`Found '${CliOption.EXPORT_DATA}' but no type`);
  }
  if (lookingForExportDataJsonType) {
    throw Error(`Found '${CliOption.EXPORT_DATA_JSON}' but no type`);
  }
  return options;
};
