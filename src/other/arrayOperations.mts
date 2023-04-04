// Package imports
import { deepCopy } from "deep-copy-ts";
// Type imports
import type { DeepReadonly, OrReadonlyArray, OrUndef } from "./types.mjs";

export const convertValueToArray = <TYPE extends unknown>(
  value: OrReadonlyArray<DeepReadonly<TYPE>>,
): TYPE[] =>
  Array.isArray(value) ? deepCopy(value) : [deepCopy(value as TYPE)];

export const convertUndefValueToArray = <TYPE extends unknown>(
  value: OrUndef<OrReadonlyArray<DeepReadonly<TYPE>>>,
): TYPE[] => (value === undefined ? [] : convertValueToArray(value));
