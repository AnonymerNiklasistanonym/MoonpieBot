/*
 * Version structure.
 */

/**
 * The Version structure.
 */
export interface Version {
  /** Set true for beta builds/versions. */
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
