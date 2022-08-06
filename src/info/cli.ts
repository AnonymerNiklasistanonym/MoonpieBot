// Package imports
import path from "path";
// Type imports
import type { CliOptionInformation } from "../cli";

/**
 * Command line interface variable handling.
 */

/**
 * CLI options.
 */
export enum CliOption {
  CONFIG_DIRECTORY = "--config-dir",
  CREATE_EXAMPLE_FILES = "--create-example-files",
  DISABLE_CENSORING = "--disable-censoring",
  HELP = "--help",
  VERSION = "--version",
}

export interface CliOptionData extends CliOptionInformation<CliOption> {
  /** The default value for example to display relative paths in 'default' but use absolute path as 'defaultValue'. */
  defaultValue?: string | ((configDir: string) => string);
}

/**
 * Command line interface variable information.
 */
export const cliOptionInformation: CliOptionData[] = [
  {
    name: CliOption.CONFIG_DIRECTORY,
    default: (configDir) =>
      process.cwd() === path.resolve(configDir) ? "." + path.sep : configDir,
    defaultValue: (configDir) => path.resolve(configDir),
    description:
      "The directory that should contain all configurations and databases if not configured otherwise",
    signature: "CONFIG_DIR",
  },
  {
    name: CliOption.DISABLE_CENSORING,
    description:
      "Disabling the censoring stops the censoring of private tokens which is helpful to debug if the inputs are read correctly but should otherwise be avoided",
  },
  {
    name: CliOption.CREATE_EXAMPLE_FILES,
    description:
      "Creates example files (for custom commands and timers) in the specified configuration directory",
  },
  {
    name: CliOption.HELP,
    description: "Get instructions on how to run and configure this program",
  },
  {
    name: CliOption.VERSION,
    description: "Get the version of the program",
  },
];
