// Local imports
import { genericStringSorter } from "../../other/genericStringSorter";
import { ParseTreeNodeErrorCode } from "../errors";
// Type imports
import type { MessageParserPlugin } from "../plugins";

const pluginIfEmptyLogic = (content?: string): boolean =>
  content === undefined || content.trim().length === 0;

export const pluginIfEmpty: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the supplied value is empty",
  examples: [
    { argument: "not empty", expectedOutput: "", scope: "Will not be shown" },
    { argument: "", expectedOutput: "Will be shown", scope: "Will be shown" },
    { argument: "not empty", expectedOutput: "" },
    { expectedErrorCode: ParseTreeNodeErrorCode.NO_PLUGIN_CONTENT_AND_VALUE },
  ],
  func: (_, content, signature) => {
    if (signature === true) {
      return { argument: "value", scope: "showIfEmpty", type: "signature" };
    }
    return pluginIfEmptyLogic(content);
  },
  id: "IF_EMPTY",
};

export const pluginIfNotEmpty: MessageParserPlugin = {
  description: `Opposite of ${pluginIfEmpty.id}`,
  examples: [
    {
      argument: "not empty",
      expectedOutput: "Will be shown",
      scope: "Will be shown",
    },
    { argument: "", expectedOutput: "", scope: "Will not be shown" },
    { argument: "not empty", expectedOutput: "not empty" },
    { argument: "", expectedOutput: "" },
  ],
  func: (_, content, signature) => {
    if (signature === true) {
      return { argument: "value", scope: "showIfNotEmpty", type: "signature" };
    }
    return !pluginIfEmptyLogic(content);
  },
  id: "IF_NOT_EMPTY",
};

const pluginIfNotUndefinedAndMatchesStringLogic = (
  shouldMatch: string,
  content?: string
): boolean =>
  content !== undefined && content.trim().toLowerCase() === shouldMatch;

export const pluginIfTrue: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the supplied value is 'true'",
  examples: [
    {
      argument: "true",
      expectedOutput: "Will be shown",
      scope: "Will be shown",
    },
    { argument: "false", expectedOutput: "", scope: "Will not be shown" },
    { argument: "true", expectedOutput: "true" },
    { argument: "false", expectedOutput: "" },
  ],
  func: (_, content, signature) => {
    if (signature === true) {
      return {
        argument: "value",
        scope: "showIfTrue",
        type: "signature",
      };
    }
    return pluginIfNotUndefinedAndMatchesStringLogic("true", content);
  },
  id: "IF_TRUE",
};

export const pluginIfFalse: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the supplied value is 'false'",
  examples: [
    { argument: "true", scope: "Will not be shown" },
    { argument: "false", scope: "Will be shown" },
    { argument: "true" },
    { argument: "false" },
  ],
  func: (_, content, signature) => {
    if (signature === true) {
      return {
        argument: "value",
        scope: "showIfFalse",
        type: "signature",
      };
    }
    return pluginIfNotUndefinedAndMatchesStringLogic("false", content);
  },
  id: "IF_FALSE",
};

export const pluginIfUndefined: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the supplied value is 'undefined'",
  examples: [
    { argument: "undefined", scope: "Will be shown" },
    { argument: "not undefined", scope: "Will not be shown" },
    { argument: "undefined" },
    { argument: "not undefined" },
  ],
  func: (_, content, signature) => {
    if (signature === true) {
      return {
        argument: "value",
        scope: "showIfUndefined",
        type: "signature",
      };
    }
    return pluginIfNotUndefinedAndMatchesStringLogic("undefined", content);
  },
  id: "IF_UNDEFINED",
};

export const pluginIfNotUndefined: MessageParserPlugin = {
  description: `Opposite of ${pluginIfUndefined.id}`,
  examples: [
    { argument: "undefined", scope: "Will not be shown" },
    { argument: "not undefined", scope: "Will be shown" },
    { argument: "undefined" },
    { argument: "not undefined" },
  ],
  func: (_, content, signature) => {
    if (signature === true) {
      return {
        argument: "value",
        scope: "showIfNotUndefined",
        type: "signature",
      };
    }
    return !pluginIfNotUndefinedAndMatchesStringLogic("undefined", content);
  },
  id: "IF_NOT_UNDEFINED",
};

const pluginIfEqualLogic = (
  splitAt: string,
  aStringEqualsBString?: string
): boolean => {
  if (
    aStringEqualsBString === undefined ||
    aStringEqualsBString.trim().length === 0
  ) {
    throw Error("No strings were found");
  }
  const givenStrings = aStringEqualsBString.trim().split(splitAt);
  if (givenStrings.length === 2) {
    return givenStrings[0] === givenStrings[1];
  }
  throw Error(
    `More or less than 2 strings were given! (${aStringEqualsBString}=>${JSON.stringify(
      givenStrings
    )})`
  );
};

export const pluginIfEqual: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the two supplied strings separated by '===' are the same",
  examples: [
    { argument: "hello===hello", scope: "Will be shown" },
    { argument: "hello===goodbye", scope: "Will not be shown" },
  ],
  func: (_, aStringEqualsBString, signature) => {
    const separator = "===";
    if (signature === true) {
      return {
        argument: `string${separator}string`,
        scope: "showIfEqual",
        type: "signature",
      };
    }
    return pluginIfEqualLogic(separator, aStringEqualsBString) ? new Map() : "";
  },
  id: "IF_EQUAL",
};

export const pluginIfNotEqual: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the two supplied strings separated by '!==' are not the same",
  examples: [
    { argument: "hello!==hello", scope: "Will not be shown" },
    { argument: "hello!==goodbye", scope: "Will be shown" },
  ],
  func: (_, aStringEqualsBString, signature) => {
    const separator = "!==";
    if (signature === true) {
      return {
        argument: `string${separator}string`,
        scope: "showIfNotEqual",
        type: "signature",
      };
    }
    return !pluginIfEqualLogic(separator, aStringEqualsBString)
      ? new Map()
      : "";
  },
  id: "IF_NOT_EQUAL",
};

const pluginIfCompareNumbersLogic = (
  splitAt: string,
  operation: (num1: number, num2: number) => boolean,
  aNumOperationBNum?: string
): boolean => {
  if (
    aNumOperationBNum === undefined ||
    aNumOperationBNum.trim().length === 0
  ) {
    throw Error("No numbers were found");
  }
  const givenNumbers = aNumOperationBNum
    .trim()
    .split(splitAt)
    .map((a) => parseInt(a));
  if (givenNumbers.length === 2) {
    return operation(givenNumbers[0], givenNumbers[1]);
  }
  throw Error(
    `More or less than 2 numbers were given ${aNumOperationBNum}=[${givenNumbers.join(
      ","
    )}]!`
  );
};

export const pluginIfGreater: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the first of the two supplied numbers separated by '>' is greater than the second one",
  examples: [
    { argument: "10>1", scope: "Will be shown" },
    { argument: "2>4", scope: "Will not be shown" },
    { argument: "2>2", scope: "Will not be shown" },
  ],
  func: (_, aNumGreaterBNum, signature) => {
    const separator = ">";
    if (signature === true) {
      return {
        argument: `number${separator}number`,
        scope: "showIfGreater",
        type: "signature",
      };
    }
    return pluginIfCompareNumbersLogic(
      separator,
      (a, b) => a > b,
      aNumGreaterBNum
    )
      ? new Map()
      : "";
  },
  id: "IF_GREATER",
};

export const pluginIfNotGreater: MessageParserPlugin = {
  description: `Opposite of ${pluginIfGreater.id}`,
  examples: [
    { argument: "10<=1", scope: "Will not be shown" },
    { argument: "2<=4", scope: "Will be shown" },
    { argument: "2<=2", scope: "Will be shown" },
  ],
  func: (_, aNumGreaterBNum, signature) => {
    const separator = "<=";
    if (signature === true) {
      return {
        argument: `number${separator}number`,
        scope: "showIfNotGreater",
        type: "signature",
      };
    }
    return pluginIfCompareNumbersLogic(
      separator,
      (a, b) => a <= b,
      aNumGreaterBNum
    )
      ? new Map()
      : "";
  },
  id: "IF_NOT_GREATER",
};

export const pluginIfSmaller: MessageParserPlugin = {
  description:
    "Plugin that only displays text inside of its scope if the first of the two supplied numbers separated by '<' is smaller than the second one",
  examples: [
    { argument: "10<1", scope: "Will not be shown" },
    { argument: "2<4", scope: "Will be shown" },
    { argument: "2<2", scope: "Will not be shown" },
  ],
  func: (_, aNumSmallerBNum, signature) => {
    const separator = "<";
    if (signature === true) {
      return {
        argument: `number${separator}number`,
        scope: "showIfSmaller",
        type: "signature",
      };
    }
    return pluginIfCompareNumbersLogic(
      separator,
      (a, b) => a < b,
      aNumSmallerBNum
    )
      ? new Map()
      : "";
  },
  id: "IF_SMALLER",
};

export const pluginIfNotSmaller: MessageParserPlugin = {
  description: `Opposite of ${pluginIfSmaller.id}`,
  examples: [
    { argument: "10>=1", scope: "Will be shown" },
    { argument: "2>=4", scope: "Will not be shown" },
    { argument: "2>=2", scope: "Will be shown" },
  ],
  func: (_, aNumNotSmallerBNum, signature) => {
    const separator = ">=";
    if (signature === true) {
      return {
        argument: `number${separator}number`,
        scope: "showIfSmaller",
        type: "signature",
      };
    }
    return pluginIfCompareNumbersLogic(
      separator,
      (a, b) => a >= b,
      aNumNotSmallerBNum
    )
      ? new Map()
      : "";
  },
  id: "IF_NOT_SMALLER",
};

export const pluginLowercase: MessageParserPlugin = {
  description: "Converts the plugin argument to lowercase letters",
  examples: [{ argument: "Hello World!", expectedOutput: "hello world!" }],
  func: (_, content, signature) => {
    if (signature === true) {
      return {
        argument: "string",
        type: "signature",
      };
    }
    return content === undefined ? "" : content.toLowerCase();
  },
  id: "LOWERCASE",
};

export const pluginUppercase: MessageParserPlugin = {
  description: "Converts the plugin argument to uppercase letters",
  examples: [{ argument: "Hello World!", expectedOutput: "HELLO WORLD!" }],
  func: (_, content, signature) => {
    if (signature === true) {
      return {
        argument: "string",
        type: "signature",
      };
    }
    return content === undefined ? "" : content.toUpperCase();
  },
  id: "UPPERCASE",
};

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const pluginRandomNumber: MessageParserPlugin = {
  description: "Returns a random number between 1 and 100 or a custom range",
  examples: [
    { before: "Random number between 1 and 100: ", hideOutput: true },
    {
      argument: "10",
      before: "Random number between 1 and 10: ",
      hideOutput: true,
    },
    {
      argument: "-100<->0",
      before: "Random number between -100 and 0: ",
      hideOutput: true,
    },
    {
      argument: "0",
      expectedOutput: "0",
    },
    {
      argument: "-100<->-100",
      expectedOutput: "-100",
    },
  ],
  func: (_logger, interval, signature) => {
    if (signature === true) {
      return {
        argument: ["", "number", "number<->number"],
        type: "signature",
      };
    }
    // If no interval string is given assume number between 0 an 100
    if (interval === undefined || interval.trim().length === 0) {
      return `${randomIntFromInterval(0, 100)}`;
    }
    const givenNumbers = interval
      .trim()
      .split("<->")
      .map((a) => parseInt(a));
    if (givenNumbers.length === 1) {
      if (givenNumbers[0] >= 0) {
        return `${randomIntFromInterval(0, givenNumbers[0])}`;
      } else {
        return `${randomIntFromInterval(givenNumbers[0], 0)}`;
      }
    }
    if (givenNumbers.length === 2) {
      return `${randomIntFromInterval(givenNumbers[0], givenNumbers[1])}`;
    }
    throw Error("More than 2 numbers were given");
  },
  id: "RANDOM_NUMBER",
};

const minuteInSeconds = 60;
const hourInSeconds = minuteInSeconds * 60;
const dayInSeconds = hourInSeconds * 24;
const yearInSeconds = dayInSeconds * 365;

/**
 * Calculate from seconds the amount of minutes, hours, days, years.
 *
 * @param seconds The length of the time period in seconds.
 * @returns Object that contains the seconds-years of that second amount.
 */
const secondsToObject = (seconds: number) => {
  const yearsNumber = Math.floor(seconds / yearInSeconds);
  const daysNumber = Math.floor((seconds % yearInSeconds) / dayInSeconds);
  const hoursNumber = Math.floor(
    ((seconds % yearInSeconds) % dayInSeconds) / hourInSeconds
  );
  const minutesNumber = Math.floor(
    (((seconds % yearInSeconds) % dayInSeconds) % hourInSeconds) /
      minuteInSeconds
  );
  const secondsNumber = Math.floor(
    (((seconds % yearInSeconds) % dayInSeconds) % hourInSeconds) %
      minuteInSeconds
  );

  return {
    days: daysNumber,
    hours: hoursNumber,
    minutes: minutesNumber,
    seconds: secondsNumber,
    years: yearsNumber,
  };
};

export const pluginTimeInSToStopwatchString: MessageParserPlugin = {
  description: "Converts a seconds number to a stopwatch like string",
  examples: [
    {
      argument: "3600",
      before: "3600s will be converted to ",
      expectedOutput: "3600s will be converted to 01:00:00 h",
    },
    {
      argument: "62",
      before: "62s will be converted to ",
      expectedOutput: "62s will be converted to 01:02 min",
    },
  ],
  func: (_logger, timeInS, signature) => {
    if (signature === true) {
      return { argument: "timeInS", type: "signature" };
    }
    if (timeInS === undefined) {
      throw Error("Time was undefined");
    }
    const seconds = parseInt(timeInS);
    const secondsObject = secondsToObject(seconds);
    let timeUnit = "min";
    const timeList = [secondsObject.minutes, secondsObject.seconds];
    if (secondsObject.years > 0) {
      timeList.unshift(
        secondsObject.years,
        secondsObject.days,
        secondsObject.hours
      );
      timeUnit = "y";
    } else if (secondsObject.days > 0) {
      timeList.unshift(secondsObject.days, secondsObject.hours);
      timeUnit = "d";
    } else if (secondsObject.hours > 0) {
      timeList.unshift(secondsObject.hours);
      timeUnit = "h";
    }
    return (
      timeList.map((a) => `${a}`.padStart(2, "0")).join(":") + ` ${timeUnit}`
    );
  },
  id: "TIME_IN_S_TO_STOPWATCH_STRING",
};

export const pluginTimeInSToHumanReadableString: MessageParserPlugin = {
  description: "Converts a seconds number to a human readable string",
  examples: [
    {
      argument: "3600234",
      before: "3600234s will be converted to ",
      expectedOutput:
        "3600234s will be converted to 41 days, 16 hours, 3 minutes and 54 seconds",
    },
    {
      argument: "3600",
      before: "3600s will be converted to ",
      expectedOutput: "3600s will be converted to 1 hour",
    },
    {
      argument: "62",
      before: "62s will be converted to ",
      expectedOutput: "62s will be converted to 1 minute and 2 seconds",
    },
  ],
  func: (_logger, timeInS, signature) => {
    if (signature === true) {
      return { argument: "timeInS", type: "signature" };
    }
    if (timeInS === undefined) {
      throw Error("Time was undefined");
    }
    const seconds = parseInt(timeInS);
    const secondsObject = secondsToObject(seconds);
    const finalStringList = [];
    if (secondsObject.years > 0) {
      finalStringList.push(
        `${secondsObject.years} year${secondsObject.years === 1 ? "" : "s"}`
      );
    }
    if (secondsObject.days > 0) {
      finalStringList.push(
        `${secondsObject.days} day${secondsObject.days === 1 ? "" : "s"}`
      );
    }
    if (secondsObject.hours > 0) {
      finalStringList.push(
        `${secondsObject.hours} hour${secondsObject.hours === 1 ? "" : "s"}`
      );
    }
    if (secondsObject.minutes > 0) {
      finalStringList.push(
        `${secondsObject.minutes} minute${
          secondsObject.minutes === 1 ? "" : "s"
        }`
      );
    }
    if (secondsObject.seconds > 0 || finalStringList.length === 0) {
      finalStringList.push(
        `${secondsObject.seconds} second${
          secondsObject.seconds === 1 ? "" : "s"
        }`
      );
    }
    const finalString = finalStringList.reduce((prev, curr, currentIndex) => {
      if (currentIndex === 0) {
        return `${curr}`;
      } else if (currentIndex < finalStringList.length - 1) {
        return `${prev}, ${curr}`;
      } else {
        return `${prev} and ${curr}`;
      }
    }, "");
    return finalString;
  },
  id: "TIME_IN_S_TO_HUMAN_READABLE_STRING",
};

const MIN_COUNT_UNTIL_S_HIDDEN = 2;
const D_COUNT_UNTIL_H_HIDDEN = 1;
const H_COUNT_UNTIL_MIN_HIDDEN = 1;

export const pluginTimeInSToHumanReadableStringShort: MessageParserPlugin = {
  description: `Short version of ${pluginTimeInSToHumanReadableString.id} that discards smaller time units if bigger ones are given`,
  examples: [
    {
      argument: "3600234",
      before: "3600234s will be converted to ",
      expectedOutput: "3600234s will be converted to 41 days",
    },
    {
      argument: "3600",
      before: "3600s will be converted to ",
      expectedOutput: "3600s will be converted to 1 hour",
    },
    {
      argument: "62",
      before: "62s will be converted to ",
      expectedOutput: "62s will be converted to 1 minute and 2 seconds",
    },
  ],
  func: (_logger, timeInS, signature) => {
    if (signature === true) {
      return { argument: "timeInS", type: "signature" };
    }
    if (timeInS === undefined) {
      throw Error("Time was undefined");
    }
    const seconds = parseInt(timeInS);
    const secondsObject = secondsToObject(seconds);
    const finalStringList = [];
    let yearsFound = false;
    let daysFound = false;
    let hoursFound = false;
    if (secondsObject.years > 0) {
      yearsFound = true;
      finalStringList.push(
        `${secondsObject.years} year${secondsObject.years === 1 ? "" : "s"}`
      );
    }
    if (secondsObject.days > 0) {
      daysFound = true;
      finalStringList.push(
        `${secondsObject.days} day${secondsObject.days === 1 ? "" : "s"}`
      );
    }
    if (!(yearsFound || secondsObject.days > D_COUNT_UNTIL_H_HIDDEN)) {
      if (secondsObject.hours > 0) {
        hoursFound = true;
        finalStringList.push(
          `${secondsObject.hours} hour${secondsObject.hours === 1 ? "" : "s"}`
        );
      }
      if (!(daysFound || secondsObject.hours > H_COUNT_UNTIL_MIN_HIDDEN)) {
        if (secondsObject.minutes > 0) {
          finalStringList.push(
            `${secondsObject.minutes} minute${
              secondsObject.minutes === 1 ? "" : "s"
            }`
          );
        }
        if (!(hoursFound || secondsObject.minutes > MIN_COUNT_UNTIL_S_HIDDEN)) {
          if (secondsObject.seconds > 0 || finalStringList.length === 0) {
            finalStringList.push(
              `${secondsObject.seconds} second${
                secondsObject.seconds === 1 ? "" : "s"
              }`
            );
          }
        }
      }
    }
    const finalString = finalStringList.reduce((prev, curr, currentIndex) => {
      if (currentIndex === 0) {
        return `${curr}`;
      } else if (currentIndex < finalStringList.length - 1) {
        return `${prev}, ${curr}`;
      } else {
        return `${prev} and ${curr}`;
      }
    }, "");
    return finalString;
  },
  id: "TIME_IN_S_TO_HUMAN_READABLE_STRING_SHORT",
};

export const pluginConvertToShortNumber: MessageParserPlugin = {
  description: "Shorten a long number into a short number string",
  examples: [
    { argument: "26934111", expectedOutput: "27M" },
    { argument: "0", expectedOutput: "0" },
    { argument: "10", expectedOutput: "10" },
    { argument: "1101", expectedOutput: "1.1K" },
    { expectedError: "Number string was undefined" },
  ],
  func: (_logger, numberString, signature) => {
    if (signature === true) {
      return {
        argument: "number",
        type: "signature",
      };
    }
    if (numberString === undefined) {
      throw Error("Number string was undefined");
    }
    const number = parseInt(numberString);
    return Intl.NumberFormat("en", { notation: "compact" }).format(number);
  },
  id: "CONVERT_TO_SHORT_NUMBER",
};

export const pluginHelp: MessageParserPlugin = {
  description: "Print all available plugins and macros",
  examples: [{ hideOutput: true }],
  func: (_, __, signature) => {
    if (signature === true) {
      return {
        argument: "",
        type: "signature",
      };
    }
    return { macros: true, plugins: true, type: "help" };
  },
  id: "HELP",
};

export const pluginListFilterUndefined: MessageParserPlugin = {
  description:
    "Filter undefined values from a list (values separated by ;) and if empty use scope",
  examples: [
    { argument: "1;2;3;4", expectedOutput: "1;2;3;4" },
    {
      argument: "1",
      expectedOutput: "1",
      scope: "list not empty so scope is ignored",
    },
    { argument: ";1;undefined;2;undefined;3;", expectedOutput: "1;2;3" },
    {
      argument: "undefined",
      expectedOutput: "scope is used if list empty",
      scope: "scope is used if list empty",
    },
    { argument: "undefined", expectedOutput: "", scope: "" },
    {
      argument: ";undefined;undefined;",
      expectedOutput: "scope is used if list empty",
      scope: "scope is used if list empty",
    },
    {
      expectedError: "List string was undefined",
    },
  ],
  func: (_logger, listString, signature) => {
    if (signature === true) {
      return {
        argument: "list",
        type: "signature",
      };
    }
    if (listString === undefined) {
      throw Error("List string was undefined");
    }
    const finalList = listString
      .split(";")
      .filter((a) => a !== "" && a !== "undefined");
    if (finalList.length === 0) {
      return true;
    }
    return finalList.join(";");
  },
  id: "LIST_FILTER_UNDEFINED",
};

export const pluginListJoinCommaSpace: MessageParserPlugin = {
  description: "Join values from a list (values separated by ;) using ', '",
  examples: [
    { argument: "1;2;3;4", expectedOutput: "1, 2, 3, 4" },
    { argument: "1", expectedOutput: "1" },
    {
      argument: ";1;undefined;2;undefined;3;",
      expectedOutput: "1, undefined, 2, undefined, 3",
    },
    { argument: "undefined", expectedOutput: "undefined" },
  ],
  func: (_logger, listString, signature) => {
    if (signature === true) {
      return {
        argument: "list",
        type: "signature",
      };
    }
    if (listString === undefined) {
      throw Error("List string was undefined");
    }
    return listString
      .split(";")
      .filter((a) => a !== "")
      .join(", ");
  },
  id: "LIST_JOIN_COMMA_SPACE",
};

export const pluginListSort: MessageParserPlugin = {
  description: "Sort values from a list (values separated by ;)",
  examples: [
    {
      argument: "8;6;-1;20;81;Herbert;Anja;Gerd is blue;",
      expectedOutput: "-1;20;6;8;81;Anja;Gerd is blue;Herbert",
    },
    { argument: "1", expectedOutput: "1" },
    {
      argument: ";1;undefined;2;undefined;3;",
      expectedOutput: "1;2;3;undefined;undefined",
    },
  ],
  func: (_logger, listString, signature) => {
    if (signature === true) {
      return {
        argument: "list",
        type: "signature",
      };
    }
    if (listString === undefined) {
      throw Error("List string was undefined");
    }
    return listString
      .split(";")
      .filter((a) => a !== "")
      .sort(genericStringSorter)
      .join(";");
  },
  id: "LIST_SORT",
};
