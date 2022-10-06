/*
 * Version structure.
 */

/**
 * The Version structure.
 */
export interface Version {
  beta?: boolean;
  major: number;
  minor: number;
  patch: number;
}

/**
 * Get a version string.
 *
 * @param version The version that should be used.
 * @param prefix The prefix of the version.
 * @returns "v1.2.3b" or "v1.2.3" if not in beta.
 */
export const getVersionFromObject = (version: Version, prefix = "v"): string =>
  `${prefix}${version.major}.${version.minor}.${version.patch}${
    version.beta ? "b" : ""
  }`;

/**
 * Get if 2 versions are the same.
 *
 * @param versionA Version A.
 * @param versionB Version B.
 * @returns True if version A and B are the same.
 */
export const isSameVersion = (versionA: Version, versionB: Version): boolean =>
  versionA.major === versionB.major &&
  versionA.minor === versionB.minor &&
  versionA.patch === versionB.patch &&
  (versionA.beta === versionB.beta ||
    (versionA.beta === undefined && versionB.beta === false) ||
    (versionA.beta === false && versionB.beta === undefined));
