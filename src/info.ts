/*
 * MoonpieBot general information
 */

import { CliVariable } from "./cli";

/** Name of the program. */
export const name = "MoonpieBot";

/** The name of the binary/executable file of the program. */
export const binaryName = name.toLowerCase();

/** Author of the program. */
export const author = "AnonymerNiklasistanonym";

/** Short description of the program. */
export const shortDescription = "A custom Twitch chat bot";

/** Long description of the program. */
export const longDescription = `Running this program will start a Twitch connected bot using information provided by either environment variables, a .env file in the same directory or given a ${CliVariable.CONFIG_DIRECTORY} argument a .env file in the specified directory. Additionally log files and the database are written to this directory if not specified otherwise. In this directory can optionally a JSON file for custom commands (customCommands.json) and custom timers (customTimers.json) be specified.`;

/**
 * Additional package description of the program.
 *
 * @param windows True if Windows paths should be used otherwise it will use Linux paths.
 * @returns String that has either the paths for the Windows installer or Linux package.
 */
export const packageDescription = (windows: boolean) =>
  `If this program is installed via a ${
    windows ? "installer" : "package"
  } it will use ${
    windows ? "%APPDATA%\\MoonpieBot" : "$HOME/.local/share/moonpiebot"
  } as the default ${CliVariable.CONFIG_DIRECTORY}.`;

/** Source code URL. */
export const sourceCodeUrl =
  "https://github.com/AnonymerNiklasistanonym/MoonpieBot";

/** Bug tracker URL. */
export const bugTrackerUrl =
  "https://github.com/AnonymerNiklasistanonym/MoonpieBot/issues";

/** License. */
export const license = "MIT";

/** License URL. */
export const licenseUrl =
  "https://github.com/AnonymerNiklasistanonym/MoonpieBot/blob/main/LICENSE";

/** Website URL. */
export const websiteUrl =
  "https://anonymerniklasistanonym.github.io/MoonpieBot/";
