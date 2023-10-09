/**
 * CLI (Command Line Interface) information.
 */

// Package imports
import { Argument, Command, Option } from "commander";
// Relative imports
import { description, name, version } from "./general.mjs";
import { ExportDataTypes } from "./export.mjs";
import { longDescription } from "./descriptions.mjs";
// Type imports
import type { OrPromise, OrUndef } from "../other/types.mjs";

export interface CliCommandOptionsGlobal {
  configDir: string;
  disableCensoring: boolean;
  verbose: boolean;
}

export type CommandOptionsMain = CliCommandOptionsGlobal;
export type CommandOptionsCreateExampleFiles = CliCommandOptionsGlobal;
export type CommandOptionsCreateBackup = CliCommandOptionsGlobal;
export type CommandOptionsImportBackup = CliCommandOptionsGlobal;

export interface CommandOptionsExportData extends CliCommandOptionsGlobal {
  json?: boolean;
}

export const getOptionFlag = (option: Readonly<Option>): string =>
  option.long ?? option.short ?? option.flags;

export const getCommandFlag = (command: Readonly<Command>): string =>
  command.name();

export const optionCustomConfigDir = new Option(
  "-c, --config-dir <string>",
  "Use a custom configuration directory instead of the current working directory",
).default(process.cwd());

export const optionDisableCensoring = new Option(
  "--disable-censoring",
  "Disabling the censoring stops the censoring of private tokens which is helpful to debug if the inputs are read correctly but should otherwise be avoided",
).default(false);

export const commandExportDataJson = new Command("export-data")
  .description("Exports data (for 3rd parties or backups)")
  .addOption(new Option("--json", "export data in JSON format").default(false))
  .addArgument(
    new Argument("type", "the type of data to export").choices(
      Object.values(ExportDataTypes),
    ),
  )
  .addArgument(
    new Argument("output", "the output file if not given in the terminal")
      .default(undefined, "print to terminal")
      .argOptional(),
  );

export const commandCreateExampleFiles = new Command("create-example-files")
  .description(
    "Creates example files (for custom commands and timers) in the specified example files directory if given or the current config directory",
  )
  .addArgument(
    new Argument("directory", "the output directory")
      .argOptional()
      .default(process.cwd()),
  );

export const commandCreateBackup = new Command("create-backup")
  .description(
    "Create a backup of all configurations and databases that can be found in the specified backup directory",
  )
  .addArgument(new Argument("directory", "the backup directory"));

export const commandImportBackup = new Command("import-backup")
  .description(
    "Import a backup of all configurations and databases that can be found in the specified backup directory",
  )
  .addArgument(new Argument("directory", "the backup directory"));

const commanderProgramBase = new Command(name)
  .description(description)
  .version(version)
  .addHelpText("afterAll", `\n${longDescription}`)
  .addOption(optionCustomConfigDir)
  .addOption(optionDisableCensoring);

export interface CliActions {
  createBackup?: (
    backupDir: string,
    options: Readonly<CommandOptionsCreateBackup>,
  ) => OrPromise<void>;
  createExampleFiles?: (
    outputDir: string,
    options: Readonly<CommandOptionsCreateExampleFiles>,
  ) => OrPromise<void>;
  exportData?: (
    type: ExportDataTypes,
    outputFile: OrUndef<string>,
    options: Readonly<CommandOptionsExportData>,
  ) => OrPromise<void>;
  importBackup?: (
    backupDir: string,
    options: Readonly<CommandOptionsImportBackup>,
  ) => OrPromise<void>;
  main?: (options: Readonly<CommandOptionsMain>) => OrPromise<void>;
}

// TODO Validate arguments
/**
 * @param cliActions Callback actions.
 * @returns Commander program to parse CLI arguments.
 */
export const createProgram = (cliActions: Readonly<CliActions>): Command =>
  commanderProgramBase
    .addCommand(
      commandExportDataJson.action(
        (
          type: ExportDataTypes,
          output: OrUndef<string>,
          _,
          command: Command,
        ) =>
          cliActions.exportData
            ? cliActions.exportData(
                type,
                output,
                command.optsWithGlobals<CommandOptionsExportData>(),
              )
            : undefined,
      ),
    )
    .addCommand(
      commandCreateExampleFiles.action(
        (directory: string, _, command: Command) =>
          cliActions.createExampleFiles
            ? cliActions.createExampleFiles(
                directory,
                command.optsWithGlobals<CommandOptionsCreateExampleFiles>(),
              )
            : undefined,
      ),
    )
    .addCommand(
      commandCreateBackup.action((directory: string, _, command: Command) =>
        cliActions.createBackup
          ? cliActions.createBackup(
              directory,
              command.optsWithGlobals<CommandOptionsCreateBackup>(),
            )
          : undefined,
      ),
    )
    .addCommand(
      commandImportBackup.action((directory: string, _, command: Command) =>
        cliActions.importBackup
          ? cliActions.importBackup(
              directory,
              command.optsWithGlobals<CommandOptionsImportBackup>(),
            )
          : undefined,
      ),
    )
    .action((_, command: Command) =>
      cliActions.main
        ? cliActions.main(command.optsWithGlobals<CommandOptionsMain>())
        : undefined,
    );

/**
 * Parse CLI arguments.
 * @param cliArgs CLI arguments.
 * @param cliActions Callback actions.
 */
export const parseCliArgs = async (
  cliArgs: readonly string[],
  cliActions: CliActions,
): Promise<void> => {
  await createProgram(cliActions).parseAsync(cliArgs);
};
