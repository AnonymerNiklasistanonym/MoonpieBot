/**
 * Convert a time period in seconds to a human readable string
 *
 * @todo Update so it works for time periods that have more than 24 hours
 *
 * @param seconds length of the time period in seconds
 * @returns Human readable string representation of time period
 */
export const secondsToString = (seconds: number) => {
  const hoursNumber = Math.floor(((seconds % 31536000) % 86400) / 3600);
  const minutesNumber = Math.floor(
    (((seconds % 31536000) % 86400) % 3600) / 60
  );
  const secondsNumber = Math.floor(
    (((seconds % 31536000) % 86400) % 3600) % 60
  );
  let finalString = "";
  let addAnd = false;
  if (hoursNumber > 0) {
    finalString += `${hoursNumber} hour${hoursNumber === 1 ? "" : "s"}`;
    addAnd = true;
  }
  if (minutesNumber > 0) {
    if (addAnd) {
      finalString += " and ";
    }
    finalString += `${minutesNumber} minute${minutesNumber === 1 ? "" : "s"}`;
    addAnd = true;
  }
  if (secondsNumber > 0 || addAnd === false) {
    if (addAnd) {
      finalString += " and ";
    }
    finalString += `${secondsNumber} second${secondsNumber === 1 ? "" : "s"}`;
    addAnd = true;
  }
  return finalString;
};
