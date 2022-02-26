/**
 * Version handling
 */

export const version = {
  major: 1,
  minor: 0,
  patch: 1,
  beta: true,
};

export const getVersion = () =>
  `v${version.major}.${version.minor}.${version.patch}${
    version.beta ? "b" : ""
  }`;
