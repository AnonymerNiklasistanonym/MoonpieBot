/**
 * File path information.
 */

const EXAMPLE_SUFFIX = ".example";

/** The file name of the file that contains ENV variable values. */
export const fileNameEnv = ".env";
/** The example file of {@link fileNameEnv}. */
export const fileNameEnvExample = `${fileNameEnv}${EXAMPLE_SUFFIX}`;
/** The file name of the file that contains ENV variable values for custom strings. */
export const fileNameEnvStrings = `${fileNameEnv}.strings`;
/** The example file of {@link fileNameEnvStrings}. */
export const fileNameEnvStringsExample = `${fileNameEnvStrings}${EXAMPLE_SUFFIX}`;

/** The file name of the file that contains examples for custom commands and broadcasts. */
export const fileNameCustomCommandsBroadcastsExample =
  "customCommandsBroadcasts.example.txt";

/**
 * @param platform The operating platform.
 * @returns The default config directory when installed as a package.
 */
export const defaultConfigDir = (platform: "win32" | "linux"): string =>
  platform === "win32"
    ? "%APPDATA%\\MoonpieBot"
    : "$HOME/.local/share/moonpiebot";

/**
 * A function to create the directory name of an old MoonpieBot configuration depending
 * on the current date.
 *
 * @param date The current date.
 * @returns The file name.
 */
export const generateOutputDirNameOldConfig = (
  date: Readonly<Date> = new Date(),
): string =>
  `old_config_${date
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "")
    .replaceAll(/\s/g, "_")
    .replaceAll(/:/g, "-")}`;
