/*
 * MoonpieBot general information.
 */

import packageJson from "#package.json" assert { type: "json" };

/** Name of the program. */
export const displayName = "MoonpieBot";

export const name = packageJson.name;

export const author = packageJson.author;
export const description = packageJson.description;
export const license = packageJson.license;
export const version = packageJson.version;
export const websiteUrl = packageJson.homepage;

/** Source code URL. */
export const sourceCodeUrl = packageJson.repository.url;

/** Bug tracker URL. */
export const bugTrackerUrl = packageJson.bugs.url;

/** License URL. */
export const licenseUrl =
  "https://github.com/AnonymerNiklasistanonym/MoonpieBot/blob/main/LICENSE";
