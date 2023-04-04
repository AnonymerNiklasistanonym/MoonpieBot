/*
 * Version information and comparison.
 */

// Package imports
import semver from "semver";
// Type imports
import type { ComparatorValues } from "./other/genericStringSorter.mjs";
import type { SemVer } from "semver";

/**
 * @param version The version.
 * @returns Version information.
 * @throws If the version is not valid.
 */
export const getVersionInfo = (version: string): SemVer => {
  const parsedVersion = semver.parse(version);
  if (parsedVersion == null) {
    throw Error("Version was not valid!");
  }
  return parsedVersion;
};

/**
 * @param v1 Current version.
 * @param v2 New version.
 * @returns 0 if v1 == v2, 1 if v1 is greater, -1 if v2 is greater.
 */
export const compareVersions = (
  v1: Readonly<SemVer>,
  v2: Readonly<SemVer>,
): ComparatorValues => semver.compare(v1, v2);
