/*
 * Version structure
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
 * Get a version string.
 *
 * @param version The version that should be used.
 * @returns "1.2.3b" or "1.2.3" if not in beta.
 */
export const getVersionFromObject = (version: Version) =>
  `v${version.major}.${version.minor}.${version.patch}${
    version.beta ? "b" : ""
  }`;
