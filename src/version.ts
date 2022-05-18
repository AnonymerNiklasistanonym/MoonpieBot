/*
 * Version handling
 */

/**
 * The Version structure.
 */
export interface Version {
  major: number;
  minor: number;
  patch: number;
  beta?: boolean;
}

/**
 * The version of the program.
 */
export const version: Version = {
  major: 1,
  minor: 0,
  patch: 5,
  beta: false,
};

/**
 * Get a version string.
 *
 * @param version The version that should be used.
 * @returns "1.2.3b" or "1.2.3" if not in beta.
 */
export const getVersionFromObject = (version: Version) =>
  `v${version.major}.${version.minor}.${version.patch}${
    version.beta ? "b" : ""
  }`;

/**
 * Get a version string of the current program version.
 *
 * @returns "1.2.3b" or "1.2.3" if not in beta.
 */
export const getVersion = () => getVersionFromObject(version);
