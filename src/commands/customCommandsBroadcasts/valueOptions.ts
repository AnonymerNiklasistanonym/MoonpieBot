// Package imports
import cron from "node-cron";

export enum CustomBroadcastValueOptions {
  CRON_STRING = "cronString",
  DESCRIPTION = "description",
  ID = "id",
  MESSAGE = "message",
}
export const validateCustomBroadcastValue = (
  option: CustomBroadcastValueOptions,
  optionValue?: string
): string => {
  switch (option) {
    case CustomBroadcastValueOptions.DESCRIPTION:
    case CustomBroadcastValueOptions.ID:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      break;
    case CustomBroadcastValueOptions.MESSAGE:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      // TODO
      break;
    case CustomBroadcastValueOptions.CRON_STRING:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      if (!cron.validate(optionValue)) {
        throw Error("Cron string not valid!");
      }
      break;
  }
  return optionValue;
};

export enum CustomCommandValueOptions {
  COOLDOWN_IN_S = "cooldownInS",
  COUNT = "count",
  DESCRIPTION = "description",
  ID = "id",
  MESSAGE = "message",
  REGEX = "regex",
  USER_LEVEL = "userLevel",
}
export const validateCustomCommandValue = (
  option: CustomCommandValueOptions,
  optionValue?: string
): string => {
  switch (option) {
    case CustomCommandValueOptions.COOLDOWN_IN_S:
    case CustomCommandValueOptions.COUNT:
      if (optionValue === undefined) {
        throw Error("Number value was undefined!");
      }
      // eslint-disable-next-line no-case-declarations
      const floatValue = parseFloat(optionValue);
      if (isNaN(floatValue)) {
        throw Error("Number value was NaN!");
      }
      if (!isFinite(floatValue)) {
        throw Error("Number value was not finite!");
      }
      break;
    case CustomCommandValueOptions.DESCRIPTION:
    case CustomCommandValueOptions.ID:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      break;
    case CustomCommandValueOptions.MESSAGE:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      // TODO
      break;
    case CustomCommandValueOptions.REGEX:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      try {
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(optionValue, "i");
      } catch (err) {
        // TODO Add error information
        throw Error(`Regex value was bad (${(err as Error).message})!`);
      }
      break;
    case CustomCommandValueOptions.USER_LEVEL:
      if (optionValue === undefined) {
        throw Error("String value was undefined!");
      }
      // TODO
      break;
  }
  return optionValue;
};
