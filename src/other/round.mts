/**
 * Round a number to a given amount of decimal places.
 * @param num Number to round.
 * @param decimalPlaces The number of decimal places to round to.
 * @returns Rounded number.
 */
export const roundNumber = (num: number, decimalPlaces = 2): number => {
  const powerOf10 = 10 ** decimalPlaces;
  return Math.round((num + Number.EPSILON) * powerOf10) / powerOf10;
};
