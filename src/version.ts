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
 * @returns "1.2.3b" or "1.2.3" if not in beta.
 */
export const getVersionFromObject = (version: Version) =>
  `v${version.major}.${version.minor}.${version.patch}${
    version.beta ? "b" : ""
  }`;
