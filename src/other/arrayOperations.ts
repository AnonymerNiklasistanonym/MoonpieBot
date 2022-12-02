// Type imports
import type { OrArray } from "./types";

export const convertValueToArray = <TYPE>(value: OrArray<TYPE>): TYPE[] =>
  Array.isArray(value) ? value : [value];

export const convertUndefValueToArray = <TYPE>(value?: OrArray<TYPE>): TYPE[] =>
  value === undefined ? [] : convertValueToArray(value);
