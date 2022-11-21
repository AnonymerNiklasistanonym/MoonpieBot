// Local imports
import {
  ENV_LIST_SPLIT_CHARACTER,
  EnvVariableOnOff,
  EnvVariableOtherListOptions,
} from "./info/env";
// Type imports
import { DeepReadonly, EMPTY_OBJECT } from "./other/types";

export type GetConfig<T, CUSTOM_DATA extends EMPTY_OBJECT = EMPTY_OBJECT> = (
  configDir: string,
  customData?: CUSTOM_DATA
) => DeepReadonly<T> | Promise<DeepReadonly<T>>;

export type GetCustomEnvValueFromConfig<T> = (
  envVariable: string,
  config: DeepReadonly<T>
) => string | undefined;

/**
 * Convert variable value to a boolean value.
 *
 * @param variableValue Input string.
 * @returns True if ON else false.
 */
export const convertToBoolean = (
  variableValue: string | undefined
): boolean => {
  return variableValue?.toUpperCase() === EnvVariableOnOff.ON;
};

/**
 * Convert variable value to a boolean value if not undefined.
 *
 * @param variableValue Input string.
 * @returns True if ON else false otherwise undefined.
 */
export const convertToBooleanIfNotUndefined = (
  variableValue: string | undefined
): boolean | undefined => {
  if (variableValue === undefined) {
    return undefined;
  }
  return convertToBoolean(variableValue);
};

/**
 * Convert variable value to a string array.
 *
 * @param variableValue Input string.
 * @returns StringArray.
 */
export const convertToStringArray = (variableValue: string): string[] => {
  const tempArray = variableValue
    .split(ENV_LIST_SPLIT_CHARACTER)
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
  if (tempArray.includes(EnvVariableOtherListOptions.NONE)) {
    return [];
  }
  return tempArray;
};

/**
 * Convert number string to integer or throw error if not possible.
 *
 * @param variableValue Input string.
 * @param errorMessage Custom error message.
 * @returns Number value if valid number.
 */
export const convertToInt = (
  variableValue: string,
  errorMessage = "Could not parse environment variable value string to integer"
): number => {
  const possibleInteger = parseInt(variableValue);
  if (Number.isInteger(possibleInteger)) {
    return possibleInteger;
  }
  throw Error(`${errorMessage} ('${variableValue}')`);
};

/**
 * Convert number string to integer or throw error if not possible if the input string not undefined.
 *
 * @param variableValue Input string.
 * @param errorMessage Custom error message.
 * @returns Number value if valid number.
 */
export const convertToIntIfNotUndefined = (
  variableValue: string | undefined,
  errorMessage = "Could not parse environment variable value string to integer"
): number | undefined => {
  if (variableValue === undefined) {
    return undefined;
  }
  return convertToInt(variableValue, errorMessage);
};

export const convertFromStringArray = (
  stringArray?: Readonly<string[]>
): string | undefined => {
  if (stringArray === undefined) {
    return undefined;
  }
  if (stringArray.length === 0) {
    return EnvVariableOtherListOptions.NONE;
  }
  return stringArray.join(ENV_LIST_SPLIT_CHARACTER);
};

export const convertFromInteger = (num?: number): string | undefined => {
  if (num === undefined) {
    return undefined;
  }
  return `${num}`;
};

export const convertFromBoolean = (bool?: boolean): string | undefined => {
  if (bool === undefined) {
    return undefined;
  }
  return bool ? EnvVariableOnOff.ON : EnvVariableOnOff.OFF;
};
