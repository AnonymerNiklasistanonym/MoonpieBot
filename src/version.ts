/*
 * Version structure.
 */

// Local imports
import { convertUndefinedToCustomValue } from "./other/types";

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
export const getVersionFromObject = (
  version: Readonly<Version>,
  prefix = "v"
): string =>
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
export const isSameVersion = (
  versionA: Readonly<Version>,
  versionB: Readonly<Version>
): boolean =>
  versionA.major === versionB.major &&
  versionA.minor === versionB.minor &&
  versionA.patch === versionB.patch &&
  convertUndefinedToCustomValue(versionA.beta, false) ===
    convertUndefinedToCustomValue(versionB.beta, false);

/**
 * Get if one version is smaller than the other one.
 *
 * @param versionA Version A.
 * @param versionB Version B.
 * @returns True if version A is smaller than version B.
 */
export const isSmallerVersion = (
  versionA: Readonly<Version>,
  versionB: Readonly<Version>
): boolean =>
  versionA.major < versionB.major
    ? true
    : versionA.major === versionB.major && versionA.minor < versionB.minor
    ? true
    : versionA.major === versionB.major &&
      versionA.minor === versionB.minor &&
      versionA.patch < versionB.patch
    ? true
    : versionA.major === versionB.major &&
      versionA.minor === versionB.minor &&
      versionA.patch === versionB.patch &&
      convertUndefinedToCustomValue(versionA.beta, false) !==
        convertUndefinedToCustomValue(versionB.beta, false) &&
      versionB.beta === true;
