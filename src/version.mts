/*
 * Version object and comparison.
 */

// Type imports
import type { ComparatorValues } from "./other/genericStringSorter.mjs";
import type { DeepReadonly } from "./other/types.mjs";
// Relative imports
import { convertUndefinedToCustomValue } from "./other/types.mjs";

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
 * @param version The version.
 * @param prefix The prefix for the string.
 * @returns Version string.
 */
export const getVersionString = (
  version: DeepReadonly<Version>,
  prefix = "v"
): string =>
  `${prefix}${version.major}.${version.minor}.${version.patch}${
    version.beta ? "b" : ""
  }`;

/**
 * @param versionA Version A.
 * @param versionB Version B.
 * @returns Return 0 if the same version, 1 if version A is newer, -1 if version
 * B newer.
 */
export const compareVersions = (
  versionA: DeepReadonly<Version>,
  versionB: DeepReadonly<Version>
): ComparatorValues => {
  const aOlder =
    versionA.major < versionB.major ||
    (versionA.major === versionB.major && versionA.minor < versionB.minor) ||
    (versionA.major === versionB.major &&
      versionA.minor === versionB.minor &&
      versionA.patch < versionB.patch) ||
    (versionA.major === versionB.major &&
      versionA.minor === versionB.minor &&
      versionA.patch === versionB.patch &&
      convertUndefinedToCustomValue(versionA.beta, false) >
        convertUndefinedToCustomValue(versionB.beta, false));
  const aNewer =
    versionA.major > versionB.major ||
    (versionA.major === versionB.major && versionA.minor > versionB.minor) ||
    (versionA.major === versionB.major &&
      versionA.minor === versionB.minor &&
      versionA.patch > versionB.patch) ||
    (versionA.major === versionB.major &&
      versionA.minor === versionB.minor &&
      versionA.patch === versionB.patch &&
      convertUndefinedToCustomValue(versionA.beta, false) <
        convertUndefinedToCustomValue(versionB.beta, false));
  return aOlder ? -1 : aNewer ? 1 : 0;
};
