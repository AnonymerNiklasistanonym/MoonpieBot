import { MessageParserPlugin } from "../plugins";

export const pluginShowIfEmpty: MessageParserPlugin = {
  id: "SHOW_IF_EMPTY",
  func: (content?: string) =>
    content === undefined || content.trim().length === 0 ? [] : "",
};

export const pluginShowIfNotEmpty: MessageParserPlugin = {
  id: "SHOW_IF_NOT_EMPTY",
  func: (content?: string) =>
    content === undefined || content.trim().length === 0 ? "" : [],
};

export const pluginShowIfTrue: MessageParserPlugin = {
  id: "SHOW_IF_TRUE",
  func: (content?: string) =>
    content !== undefined && content.trim() === "true" ? [] : "",
};

export const pluginShowIfNotTrue: MessageParserPlugin = {
  id: "SHOW_IF_NOT_TRUE",
  func: (content?: string) =>
    content !== undefined && content.trim() === "true" ? "" : [],
};

export const pluginShowIfUndefined: MessageParserPlugin = {
  id: "SHOW_IF_UNDEFINED",
  func: (content?: string) =>
    content !== undefined && content.trim() === "undefined" ? [] : "",
};

export const pluginShowIfNotUndefined: MessageParserPlugin = {
  id: "SHOW_IF_NOT_UNDEFINED",
  func: (content?: string) =>
    content !== undefined && content.trim() === "undefined" ? "" : [],
};

export const pluginShowIfStringsTheSame: MessageParserPlugin = {
  id: "SHOW_IF_STRINGS_THE_SAME",
  description:
    "Plugin that only displays text inside of its scope if the two supplied strings are the same",
  examples: [
    { argument: "hello===goodbye", scope: "Will not be shown" },
    { argument: "hello===hello", scope: "Will be shown" },
  ],
  func: (aStringEqualsBString?: string) => {
    if (
      aStringEqualsBString === undefined ||
      aStringEqualsBString.trim().length === 0
    ) {
      throw Error("No strings were found!");
    }
    const givenStrings = aStringEqualsBString.trim().split("===");
    if (givenStrings.length === 2) {
      if (givenStrings[0] === givenStrings[1]) {
        return [];
      }
      return "";
    }
    throw Error("More than 2 strings were given!");
  },
};

export const pluginShowIfStringsNotTheSame: MessageParserPlugin = {
  id: "SHOW_IF_STRINGS_NOT_THE_SAME",
  description:
    "Plugin that only displays text inside of its scope if the two supplied strings are not the same",
  examples: [
    { before: "This", argument: "hello!==goodbye", scope: " will be shown" },
    { before: "This", argument: "hello!==hello", scope: " will not be shown" },
  ],
  func: (aStringEqualsBString?: string) => {
    if (
      aStringEqualsBString === undefined ||
      aStringEqualsBString.trim().length === 0
    ) {
      throw Error("No strings were found!");
    }
    const givenStrings = aStringEqualsBString.trim().split("!==");
    if (givenStrings.length === 2) {
      if (givenStrings[0] !== givenStrings[1]) {
        return [];
      }
      return "";
    }
    throw Error("More than 2 strings were given!");
  },
};

export const pluginShowIfNumberBiggerThan: MessageParserPlugin = {
  id: "SHOW_IF_NUMBER_BIGGER_THAN",
  func: (aBiggerThanB?: string) => {
    if (aBiggerThanB === undefined || aBiggerThanB.trim().length === 0) {
      throw Error("No numbers were found!");
    }
    const givenNumbers = aBiggerThanB
      .trim()
      .split(">")
      .map((a) => parseInt(a));
    if (givenNumbers.length === 2) {
      if (givenNumbers[0] > givenNumbers[1]) {
        return [];
      }
      return "";
    }
    throw Error(
      `More or less than 2 numbers were given ${aBiggerThanB}=[${givenNumbers.join(
        ","
      )}]!`
    );
  },
};

export const pluginShowIfNumberSmallerThan: MessageParserPlugin = {
  id: "SHOW_IF_NUMBER_SMALLER_THAN",
  func: (aSmallerThanB?: string) => {
    if (aSmallerThanB === undefined || aSmallerThanB.trim().length === 0) {
      throw Error("No numbers were found!");
    }
    const givenNumbers = aSmallerThanB
      .trim()
      .split("<")
      .map((a) => parseInt(a));
    if (givenNumbers.length === 2) {
      if (givenNumbers[0] < givenNumbers[1]) {
        return [];
      }
      return "";
    }
    throw Error("More than 2 numbers were given!");
  },
};

export const pluginLowercase: MessageParserPlugin = {
  id: "LOWERCASE",
  description: "Converts the plugin argument to lowercase letters",
  examples: [{ argument: "Hello World!" }],
  func: (content?: string) =>
    content === undefined ? "" : content.toLowerCase(),
};

export const pluginUppercase: MessageParserPlugin = {
  id: "UPPERCASE",
  description: "Converts the plugin argument to uppercase letters",
  examples: [{ argument: "Hello World!" }],
  func: (content?: string) =>
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
    { before: "Random number between -100 and 0: ", argument: "-100<-->0" },
  ],
  func: (interval?: string) => {
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
    throw Error("More than 2 numbers were given!");
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
  func: (timeInS?: string) => {
    if (timeInS === undefined) {
      throw Error("Time was undefined!");
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
  func: (timeInS?: string) => {
    if (timeInS === undefined) {
      throw Error("Time was undefined!");
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
