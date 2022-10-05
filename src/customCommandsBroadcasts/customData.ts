/**
 * The logging ID of this module.
 */
//const LOG_ID = "custom_data";

/**
 * The types of values a custom data entry can hold.
 */
export enum CustomDataValueType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  STRING_LIST = "STRING_LIST",
}

/**
 * Represents a custom data entry.
 */
export interface CustomData {
  /** A description for the command. */
  description?: string;
  /** ID of the command. */
  id: string;
  /** The value of the data. */
  value: string | number | string[];
  /** The value type of the data. */
  valueType: CustomDataValueType;
}

export interface CustomDataNumber extends CustomData {
  value: number;
  valueType: CustomDataValueType.NUMBER;
}

export interface CustomDataString extends CustomData {
  value: string;
  valueType: CustomDataValueType.STRING;
}

export interface CustomDataStringList extends CustomData {
  value: string[];
  valueType: CustomDataValueType.STRING_LIST;
}

export type CustomDataTypes =
  | CustomDataNumber
  | CustomDataString
  | CustomDataStringList;

export const convertCustomDataValueValueToString = (
  value: string | number | string[],
  valueType: CustomDataValueType
): string => {
  switch (valueType) {
    case CustomDataValueType.NUMBER:
      if (typeof value !== "number") {
        throw Error(
          `Custom data value type (${valueType}) does not fit the value (${typeof value})`
        );
      }
      return `${value}`;
    case CustomDataValueType.STRING:
      if (typeof value !== "string") {
        throw Error(
          `Custom data value type (${valueType}) does not fit the value (${typeof value})`
        );
      }
      return value;
    case CustomDataValueType.STRING_LIST:
      if (typeof value !== "object" && !Array.isArray(value)) {
        throw Error(
          `Custom data value type (${valueType}) does not fit the value (${typeof value})`
        );
      }
      return `${JSON.stringify(value)}`;
  }
};

export const convertCustomDataValueStringToValue = (
  value: string,
  valueType: CustomDataValueType
): string | number | string[] => {
  switch (valueType) {
    case CustomDataValueType.NUMBER:
      if (Number.isNaN(value)) {
        throw Error(`Custom data value is not a number (${value})`);
      }
      return Number(value);
    case CustomDataValueType.STRING:
      return value;
    case CustomDataValueType.STRING_LIST:
      try {
        const maybeStringArray = JSON.parse(value) as [];
        if (!Array.isArray(maybeStringArray)) {
          throw Error(`Custom data value is not an array (${value})`);
        }
        if (maybeStringArray.filter((a) => typeof a !== "string").length > 0) {
          throw Error(
            `Custom data value array entries not always a string (${value})`
          );
        }
        return maybeStringArray as string[];
      } catch (err) {
        throw Error(`Custom data value can not be parsed (${value})`);
      }
  }
};

export const convertCustomDataValueTypeStringToValueType = (
  valueType: string
): CustomDataValueType => {
  switch (valueType) {
    case CustomDataValueType.NUMBER:
      return CustomDataValueType.NUMBER;
    case CustomDataValueType.STRING:
      return CustomDataValueType.STRING;
    case CustomDataValueType.STRING_LIST:
      return CustomDataValueType.STRING_LIST;
    default:
      throw Error(`Unexpected value type (${valueType})`);
  }
};
