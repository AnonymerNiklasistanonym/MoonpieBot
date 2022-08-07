/*
 * Version information
 */

// Local imports
import { getVersionFromObject } from "../version";
// Type imports
import type { Version } from "../version";

/**
 * The version of the program.
 */
export const version: Version = {
  major: 1,
  minor: 0,
  patch: 16,
  beta: true,
};

/**
 * The version of the program as a string.
 */
export const versionString = getVersionFromObject(version);
