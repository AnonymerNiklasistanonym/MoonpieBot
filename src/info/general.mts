/*
 * MoonpieBot general information.
 */

// Relative imports
import { fileNameEnv, fileNameEnvStrings } from "./files.mjs";
import { CliOption } from "./cli.mjs";
import { EnvVariable } from "./env.mjs";
// Type imports
import type { CliUsageInformation } from "../cli.mjs";
import type { DeepReadonlyArray } from "../other/types.mjs";

/** Name of the program. */
export const name = "MoonpieBot";

/** The name of the binary/executable file of the program. */
export const binaryName = name.toLowerCase();

/** The usages of the program. */
export const usages: DeepReadonlyArray<CliUsageInformation> = [
  {
    signature: "[OPTIONS]",
  },
];

/** Author of the program. */
export const author = "AnonymerNiklasistanonym";

/** Short description of the program. */
export const description = "A custom Twitch chat bot";

/** Long description of the program. */
export const longDescription =
  `Running this program will start a Twitch connected bot using information provided by either environment variables, a '${fileNameEnv}' file in the same directory or given a ${CliOption.CONFIG_DIRECTORY} argument a '${fileNameEnv}' file in the specified directory. ` +
  `Additionally log files and the databases are written to this directory if not specified otherwise by '${EnvVariable.LOGGING_DIRECTORY_PATH}', '${EnvVariable.MOONPIE_DATABASE_PATH}', '${EnvVariable.SPOTIFY_DATABASE_PATH}', '${EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH}'. ` +
  `Custom strings can also be written to '${fileNameEnvStrings}' to keep the '${fileNameEnv}' clean.`;

export const defaultConfigDir = (windows: boolean): string =>
  windows ? "%APPDATA%\\MoonpieBot" : "$HOME/.local/share/moonpiebot.mjs";

/**
 * Additional package description of the program.
 *
 * @param windows True if Windows paths should be used otherwise it will use Linux paths.
 * @returns String that has either the paths for the Windows installer or Linux package.
 */
export const packageDescription = (windows: boolean): string =>
  `If this program is installed via a ${
    windows ? "installer" : "package"
  } it will use ${defaultConfigDir(windows)} as the default ${
    CliOption.CONFIG_DIRECTORY
  }.`;

/** Source code URL. */
export const sourceCodeUrl =
  "https://github.com/AnonymerNiklasistanonym/MoonpieBot.mjs";

/** Bug tracker URL. */
export const bugTrackerUrl =
  "https://github.com/AnonymerNiklasistanonym/MoonpieBot/issues.mjs";

/** License. */
export const license = "MIT";

/** License URL. */
export const licenseUrl =
  "https://github.com/AnonymerNiklasistanonym/MoonpieBot/blob/main/LICENSE.mjs";

/** Website URL. */
export const websiteUrl =
  "https://anonymerniklasistanonym.github.io/MoonpieBot/";
