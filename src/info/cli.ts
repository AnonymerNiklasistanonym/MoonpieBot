/**
 * CLI (Command Line Interface) information.
 */

// Package imports
import path from "path";
// Local imports
import { CliOptionSignaturePartType } from "../cli";
import { ExportDataTypes } from "./export";
// Type imports
import type { CliOptionInformation } from "../cli";
import type { DeepReadonly } from "../other/types";

/**
 * Supported CLI options.
 */
export enum CliOption {
  CONFIG_DIRECTORY = "--config-dir",
  CREATE_BACKUP = "--create-backup",
  CREATE_EXAMPLE_FILES = "--create-example-files",
  DISABLE_CENSORING = "--disable-censoring",
  EXPORT_DATA = "--export-data",
  EXPORT_DATA_JSON = "--export-data-json",
  HELP = "--help",
  IMPORT_BACKUP = "--import-backup",
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
      "Specify a custom directory that contains all configurations and databases",
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
      "Create a backup of all configurations and databases that can be found in the specified backup directory",
    name: CliOption.CREATE_BACKUP,
    signature: [
      {
        name: "backup",
        type: CliOptionSignaturePartType.DIRECTORY,
      },
    ],
  },
  {
    description:
      "Import a backup of all configurations and databases that can be found in the specified backup directory",
    name: CliOption.IMPORT_BACKUP,
    signature: [
      {
        name: "backup",
        type: CliOptionSignaturePartType.DIRECTORY,
      },
    ],
  },
  {
    description:
      "Creates example files (for custom commands and timers) in the specified example files directory if given or the current config directory",
    name: CliOption.CREATE_EXAMPLE_FILES,
    signature: [
      {
        name: "example_files",
        optional: true,
        type: CliOptionSignaturePartType.DIRECTORY,
      },
    ],
  },
  {
    description: "Exports certain data for backups",
    name: CliOption.EXPORT_DATA,
    signature: [
      {
        enumValues: Object.values(ExportDataTypes),
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
        enumValues: Object.values(ExportDataTypes),
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

interface ParsedCliOptionsMerged
  extends Partial<ParsedCliOptionsMainMethod>,
    Partial<ParsedCliOptionsCreateBackup>,
    Partial<ParsedCliOptionsCreateExampleFiles>,
    Partial<ParsedCliOptionsCreateExportData>,
    Partial<ParsedCliOptionsShowHelp>,
    Partial<ParsedCliOptionsShowVersion> {}

export interface ParsedCliOptionsMainMethod {
  customConfigDir?: string;
  disableCensoring?: boolean;
}
export interface ParsedCliOptionsCreateBackup {
  backupDir: string;
  createBackup: true;
  customConfigDir?: string;
}
export interface ParsedCliOptionsImportBackup {
  backupDir: string;
  customConfigDir?: string;
  importBackup: true;
}
export interface ParsedCliOptionsCreateExampleFiles {
  createExampleFiles: true;
  exampleFilesDir?: string;
}
export interface ParsedCliOptionsCreateExportData {
  customConfigDir?: string;
  exportData: ParsedCliOptionsExportData[];
}
export interface ParsedCliOptionsShowHelp {
  showHelp: true;
}
export interface ParsedCliOptionsShowVersion {
  showVersion: true;
}

export type ParsedCliOptions =
  | ParsedCliOptionsMainMethod
  | ParsedCliOptionsCreateBackup
  | ParsedCliOptionsCreateExampleFiles
  | ParsedCliOptionsCreateExportData
  | ParsedCliOptionsImportBackup
  | ParsedCliOptionsShowHelp
  | ParsedCliOptionsShowVersion;

/**
 * Parse CLI arguments.
 *
 * @param cliArgs CLI arguments.
 * @returns Parsed CLI arguments.
 */
export const parseCliArgs = (
  cliArgs: ReadonlyArray<string>
): DeepReadonly<ParsedCliOptions> => {
  // Exit early if an argument was found that terminates the program
  if (cliArgs.includes(CliOption.HELP)) {
    return { showHelp: true };
  }
  if (cliArgs.includes(CliOption.VERSION)) {
    return { showVersion: true };
  }

  const options: ParsedCliOptionsMerged = {};

  let lookingForConfigDir = false;
  let lookingForBackupDir = false;
  let lookingForImportBackupDir = false;
  let lookingForExampleFilesDir = false;
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
    if (lookingForBackupDir) {
      return {
        backupDir: cliArg,
        createBackup: true,
        customConfigDir: options.customConfigDir,
      };
    }
    if (lookingForImportBackupDir) {
      return {
        backupDir: cliArg,
        customConfigDir: options.customConfigDir,
        importBackup: true,
      };
    }
    if (lookingForExampleFilesDir) {
      return {
        createExampleFiles: true,
        customConfigDir: options.customConfigDir,
        exampleFilesDir: cliArg,
      };
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
    if (cliArg === CliOption.CREATE_BACKUP) {
      lookingForBackupDir = true;
      continue;
    }
    if (cliArg === CliOption.CREATE_EXAMPLE_FILES) {
      lookingForExampleFilesDir = true;
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
    if (cliArg === CliOption.IMPORT_BACKUP) {
      lookingForImportBackupDir = true;
      continue;
    }
    throw Error(`Found unknown CLI option '${cliArg}'`);
  }
  if (lookingForConfigDir) {
    throw Error(
      `Found '${CliOption.CONFIG_DIRECTORY}' but no config directory`
    );
  }
  if (lookingForBackupDir) {
    throw Error(`Found '${CliOption.CREATE_BACKUP}' but no backup directory`);
  }
  if (lookingForExampleFilesDir) {
    return {
      createExampleFiles: true,
      customConfigDir: options.customConfigDir,
    };
  }
  if (lookingForExportDataType) {
    throw Error(`Found '${CliOption.EXPORT_DATA}' but no type`);
  }
  if (lookingForExportDataJsonType) {
    throw Error(`Found '${CliOption.EXPORT_DATA_JSON}' but no type`);
  }
  return options;
};
