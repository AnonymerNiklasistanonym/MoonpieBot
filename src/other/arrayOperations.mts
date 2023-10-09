// Package imports
import { deepCopy } from "deep-copy-ts";
// Type imports
import type { DeepReadonly, OrReadonlyArray, OrUndef } from "./types.mjs";

export const convertValueToArray = <TYPE,>(
  value: OrReadonlyArray<DeepReadonly<TYPE>>,
): TYPE[] =>
  Array.isArray(value)
    ? deepCopy(value as Array<TYPE>)
    : [deepCopy(value as TYPE)];

export const convertUndefValueToArray = <TYPE,>(
  value: OrUndef<OrReadonlyArray<DeepReadonly<TYPE>>>,
): TYPE[] => (value === undefined ? [] : convertValueToArray(value));
