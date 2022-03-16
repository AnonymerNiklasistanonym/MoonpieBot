const minuteInSeconds = 60;
const hourInSeconds = minuteInSeconds * 60;
const dayInSeconds = hourInSeconds * 24;
const yearInSeconds = dayInSeconds * 365;

/**
 * Convert a time period in seconds to a human readable string.
 *
 * @param seconds The length of the time period in seconds.
 * @returns Human readable string representation of time period.
 */
export const secondsToString = (seconds: number) => {
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

  const finalStringList = [];
  if (yearsNumber > 0) {
    finalStringList.push(`${yearsNumber} year${yearsNumber === 1 ? "" : "s"}`);
  }
  if (daysNumber > 0) {
    finalStringList.push(`${daysNumber} day${daysNumber === 1 ? "" : "s"}`);
  }
  if (hoursNumber > 0) {
    finalStringList.push(`${hoursNumber} hour${hoursNumber === 1 ? "" : "s"}`);
  }
  if (minutesNumber > 0) {
    finalStringList.push(
      `${minutesNumber} minute${minutesNumber === 1 ? "" : "s"}`
    );
  }
  if (secondsNumber > 0 || finalStringList.length === 0) {
    finalStringList.push(
      `${secondsNumber} second${secondsNumber === 1 ? "" : "s"}`
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
};
