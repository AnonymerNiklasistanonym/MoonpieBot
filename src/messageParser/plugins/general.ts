import type { MessageParserPlugin } from "../plugins";

const pluginIfEmptyLogic = (content?: string): boolean =>
  content === undefined || content.trim().length === 0;

export const pluginIfEmpty: MessageParserPlugin = {
  id: "IF_EMPTY",
  description:
    "Plugin that only displays text inside of its scope if the supplied value is empty",
  examples: [
    { argument: "not empty", scope: "Will not be shown" },
    { argument: "", scope: "Will be shown" },
  ],
  func: (_logger, content?: string) => (pluginIfEmptyLogic(content) ? [] : ""),
};

export const pluginIfNotEmpty: MessageParserPlugin = {
  id: "IF_NOT_EMPTY",
  description: `Opposite of ${pluginIfEmpty.id}`,
  examples: [
    { argument: "not empty", scope: "Will be shown" },
    { argument: "", scope: "Will not be shown" },
  ],
  func: (_logger, content?: string) => (!pluginIfEmptyLogic(content) ? [] : ""),
};

const pluginIfNotUndefinedAndMatchesStringLogic = (
  shouldMatch: string,
  content?: string
): boolean =>
  content !== undefined && content.trim().toLowerCase() === shouldMatch;

export const pluginIfTrue: MessageParserPlugin = {
  id: "IF_TRUE",
  examples: [
    { argument: "true", scope: "Will be shown" },
    { argument: "false", scope: "Will not be shown" },
  ],
  description:
    "Plugin that only displays text inside of its scope if the supplied value is 'true'",
  func: (_logger, content?: string) =>
    pluginIfNotUndefinedAndMatchesStringLogic("true", content) ? [] : "",
};

export const pluginIfFalse: MessageParserPlugin = {
  id: "IF_FALSE",
  description:
    "Plugin that only displays text inside of its scope if the supplied value is 'false'",
  examples: [
    { argument: "true", scope: "Will not be shown" },
    { argument: "false", scope: "Will be shown" },
  ],
  func: (_logger, content?: string) =>
    pluginIfNotUndefinedAndMatchesStringLogic("false", content) ? [] : "",
};

export const pluginIfUndefined: MessageParserPlugin = {
  id: "IF_UNDEFINED",
  description:
    "Plugin that only displays text inside of its scope if the supplied value is 'undefined'",
  examples: [
    { argument: "undefined", scope: "Will be shown" },
    { argument: "abc", scope: "Will not be shown" },
  ],
  func: (_logger, content?: string) =>
    pluginIfNotUndefinedAndMatchesStringLogic("undefined", content) ? [] : "",
};

export const pluginIfNotUndefined: MessageParserPlugin = {
  id: "IF_NOT_UNDEFINED",
  description: `Opposite of ${pluginIfUndefined.id}`,
  examples: [
    { argument: "undefined", scope: "Will not be shown" },
    { argument: "abc", scope: "Will be shown" },
  ],
  func: (_logger, content?: string) =>
    !pluginIfNotUndefinedAndMatchesStringLogic("undefined", content) ? [] : "",
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
  id: "IF_EQUAL",
  description:
    "Plugin that only displays text inside of its scope if the two supplied strings separated by '===' are the same",
  examples: [
    { argument: "hello===hello", scope: "Will be shown" },
    { argument: "hello===goodbye", scope: "Will not be shown" },
  ],
  func: (_logger, aStringEqualsBString?: string) =>
    pluginIfEqualLogic("===", aStringEqualsBString) ? [] : "",
};

export const pluginIfNotEqual: MessageParserPlugin = {
  id: "IF_NOT_EQUAL",
  description:
    "Plugin that only displays text inside of its scope if the two supplied strings separated by '!==' are not the same",
  examples: [
    { argument: "hello!==hello", scope: "Will not be shown" },
    { argument: "hello!==goodbye", scope: "Will be shown" },
  ],
  func: (_logger, aStringEqualsBString?: string) =>
    !pluginIfEqualLogic("!==", aStringEqualsBString) ? [] : "",
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
  id: "IF_GREATER",
  description:
    "Plugin that only displays text inside of its scope if the first of the two supplied numbers separated by '>' is greater than the second one",
  examples: [
    { argument: "10>1", scope: "Will be shown" },
    { argument: "2>4", scope: "Will not be shown" },
    { argument: "2>2", scope: "Will not be shown" },
  ],
  func: (_logger, aNumGreaterBNum?: string) =>
    pluginIfCompareNumbersLogic(">", (a, b) => a > b, aNumGreaterBNum)
      ? []
      : "",
};

export const pluginIfNotGreater: MessageParserPlugin = {
  id: "IF_NOT_GREATER",
  description: `Opposite of ${pluginIfGreater.id}`,
  examples: [
    { argument: "10<=1", scope: "Will not be shown" },
    { argument: "2<=4", scope: "Will be shown" },
    { argument: "2<=2", scope: "Will be shown" },
  ],
  func: (_logger, aNumGreaterBNum?: string) =>
    pluginIfCompareNumbersLogic("<=", (a, b) => a <= b, aNumGreaterBNum)
      ? []
      : "",
};

export const pluginIfSmaller: MessageParserPlugin = {
  id: "IF_SMALLER",
  description:
    "Plugin that only displays text inside of its scope if the first of the two supplied numbers separated by '<' is smaller than the second one",
  examples: [
    { argument: "10<1", scope: "Will not be shown" },
    { argument: "2<4", scope: "Will be shown" },
    { argument: "2<2", scope: "Will not be shown" },
  ],
  func: (_logger, aNumSmallerBNum?: string) =>
    pluginIfCompareNumbersLogic("<", (a, b) => a < b, aNumSmallerBNum)
      ? []
      : "",
};

export const pluginIfNotSmaller: MessageParserPlugin = {
  id: "IF_NOT_SMALLER",
  description: `Opposite of ${pluginIfSmaller.id}`,
  examples: [
    { argument: "10>=1", scope: "Will be shown" },
    { argument: "2>=4", scope: "Will not be shown" },
    { argument: "2>=2", scope: "Will be shown" },
  ],
  func: (_logger, aNumNotSmallerBNum?: string) =>
    pluginIfCompareNumbersLogic(">=", (a, b) => a >= b, aNumNotSmallerBNum)
      ? []
      : "",
};

export const pluginLowercase: MessageParserPlugin = {
  id: "LOWERCASE",
  description: "Converts the plugin argument to lowercase letters",
  examples: [{ argument: "Hello World!" }],
  func: (_logger, content?: string) =>
    content === undefined ? "" : content.toLowerCase(),
};

export const pluginUppercase: MessageParserPlugin = {
  id: "UPPERCASE",
  description: "Converts the plugin argument to uppercase letters",
  examples: [{ argument: "Hello World!" }],
  func: (_logger, content?: string) =>
    content === undefined ? "" : content.toUpperCase(),
};

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const pluginRandomNumber: MessageParserPlugin = {
  id: "RANDOM_NUMBER",
  description: "Returns a random number between 1 and 100 or a custom range",
  examples: [
    { before: "Random number between 1 and 100: " },
    { before: "Random number between 1 and 10: ", argument: "10" },
    { before: "Random number between -100 and 0: ", argument: "-100<->0" },
  ],
  func: (_logger, interval?: string) => {
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
    seconds: secondsNumber,
    minutes: minutesNumber,
    hours: hoursNumber,
    days: daysNumber,
    years: yearsNumber,
  };
};

export const pluginTimeInSToStopwatchString: MessageParserPlugin = {
  id: "TIME_IN_S_TO_STOPWATCH_STRING",
  description: "Converts a seconds number to a stopwatch like string",
  examples: [
    { before: "3600s will be converted to ", argument: "3600" },
    { before: "62s will be converted to ", argument: "62" },
  ],
  func: (_logger, timeInS?: string) => {
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
};

export const pluginTimeInSToHumanReadableString: MessageParserPlugin = {
  id: "TIME_IN_S_TO_HUMAN_READABLE_STRING",
  description: "Converts a seconds number to a human readable string",
  examples: [
    { before: "3600234s will be converted to ", argument: "3600234" },
    { before: "3600s will be converted to ", argument: "3600" },
    { before: "62s will be converted to ", argument: "62" },
  ],
  func: (_logger, timeInS?: string) => {
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
};

export const pluginTimeInSToHumanReadableStringShort: MessageParserPlugin = {
  id: "TIME_IN_S_TO_HUMAN_READABLE_STRING_SHORT",
  description: `Short version of ${pluginTimeInSToHumanReadableString.id} that discards smaller time units if bigger ones are given`,
  examples: [
    { before: "3600234s will be converted to ", argument: "3600234" },
    { before: "3600s will be converted to ", argument: "3600" },
    { before: "62s will be converted to ", argument: "62" },
  ],
  func: (_logger, timeInS?: string) => {
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
    if (!(yearsFound || secondsObject.days > 1)) {
      if (secondsObject.hours > 0) {
        hoursFound = true;
        finalStringList.push(
          `${secondsObject.hours} hour${secondsObject.hours === 1 ? "" : "s"}`
        );
      }
      if (!(daysFound || secondsObject.hours > 1)) {
        if (secondsObject.minutes > 0) {
          finalStringList.push(
            `${secondsObject.minutes} minute${
              secondsObject.minutes === 1 ? "" : "s"
            }`
          );
        }
        if (!(hoursFound || secondsObject.minutes > 10)) {
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
};
