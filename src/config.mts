// Relative imports
import {
  ENV_LIST_SPLIT_CHARACTER,
  EnvVariableOnOff,
  EnvVariableOtherListOptions,
} from "./info/env.mjs";
// Type imports
import {
  DeepReadonly,
  DeepReadonlyArray,
  EMPTY_OBJECT,
  OrPromise,
  OrUndef,
} from "./other/types.mjs";

export type GetConfig<T, CUSTOM_DATA extends EMPTY_OBJECT = EMPTY_OBJECT> = (
  configDir: string,
  customData?: DeepReadonly<CUSTOM_DATA>,
) => OrPromise<DeepReadonly<T>>;

export type GetCustomEnvValueFromConfig<T> = (
  envVariable: string,
  config: DeepReadonly<T>,
) => OrUndef<string>;

/**
 * Convert variable value to a boolean value.
 *
 * @param variableValue Input string.
 * @returns True if ON else false.
 */
export const convertToBoolean = (variableValue?: string): boolean =>
  variableValue === undefined
    ? false
    : variableValue.toUpperCase() === EnvVariableOnOff.ON;

/**
 * Convert variable value to a boolean value if not undefined.
 *
 * @param variableValue Input string.
 * @returns True if ON else false otherwise undefined.
 */
export const convertToBooleanIfNotUndefined = (
  variableValue?: string,
): OrUndef<boolean> =>
  variableValue === undefined ? undefined : convertToBoolean(variableValue);

/**
 * Convert variable value to a string array.
 *
 * @param variableValue Input string.
 * @param supportedValues All supported values.
 * @returns StringArray.
 */
export const convertToStringArray = <T extends string = string>(
  variableValue: string,
  supportedValues?: DeepReadonlyArray<T>,
): T[] => {
  const tempArray = variableValue
    .split(ENV_LIST_SPLIT_CHARACTER)
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
  if (tempArray.includes(EnvVariableOtherListOptions.NONE)) {
    return [];
  }
  if (supportedValues !== undefined) {
    for (const tempValue of tempArray) {
      if (!supportedValues.map((a) => a.toString()).includes(tempValue)) {
        throw Error(
          `Found unexpected '${tempValue}' while only supporting ${supportedValues
            .map((a) => `'${a}'`)
            .join(",")}`,
        );
      }
    }
    return (supportedValues.slice() as T[]).filter((a) =>
      tempArray.includes(a),
    );
  }
  return tempArray as T[];
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
  errorMessage = "Could not parse environment variable value string to integer",
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
  variableValue: OrUndef<string>,
  errorMessage = "Could not parse environment variable value string to integer",
): OrUndef<number> =>
  variableValue === undefined
    ? undefined
    : convertToInt(variableValue, errorMessage);

export const convertFromStringArray = (
  stringArray?: readonly string[],
): OrUndef<string> =>
  stringArray === undefined
    ? undefined
    : stringArray.length === 0
    ? EnvVariableOtherListOptions.NONE
    : stringArray.join(ENV_LIST_SPLIT_CHARACTER);

export const convertFromInteger = (num?: number): OrUndef<string> =>
  num === undefined ? undefined : `${num}`;

export const convertFromBoolean = (bool?: boolean): OrUndef<string> =>
  bool === undefined
    ? undefined
    : bool
    ? EnvVariableOnOff.ON
    : EnvVariableOnOff.OFF;
