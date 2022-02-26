/*
 * Version handling
 */

/**
 * The version of the program
 */
export const version = {
  major: 1,
  minor: 0,
  patch: 1,
  beta: true,
};

/**
 * Get a version string
 * @returns "1.2.3b" or "1.2.3" if not in beta
 */
export const getVersion = () =>
  `v${version.major}.${version.minor}.${version.patch}${
    version.beta ? "b" : ""
  }`;
