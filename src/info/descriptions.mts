/*
 * MoonpieBot extended descriptions information.
 */

// Relative imports
import { defaultConfigDir, fileNameEnv, fileNameEnvStrings } from "./files.mjs";
import { EnvVariable } from "./env.mjs";

/** Long description of the program. */
export const longDescription =
  `Running this program will start a Twitch connected bot using information provided by either environment variables, a '${fileNameEnv}' file in the same directory or given a configuration directory argument a '${fileNameEnv}' file in the specified directory. ` +
  `Additionally log files and the databases are written to this directory if not specified otherwise by '${EnvVariable.LOGGING_DIRECTORY_PATH}', '${EnvVariable.MOONPIE_DATABASE_PATH}', '${EnvVariable.SPOTIFY_DATABASE_PATH}', '${EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH}'. ` +
  `Custom strings can also be written to '${fileNameEnvStrings}' to keep the '${fileNameEnv}' clean.`;

/**
 * Additional package description of the program.
 *
 * @param platform True if Windows paths should be used otherwise it will use Linux paths.
 * @returns String that has either the paths for the Windows installer or Linux package.
 */
export const packageDescription = (platform: "win32" | "linux"): string =>
  `If this program is installed via a ${
    platform === "win32" ? "installer" : "package"
  } it will use ${defaultConfigDir(
    platform,
  )} as the default configuration directory.`;
