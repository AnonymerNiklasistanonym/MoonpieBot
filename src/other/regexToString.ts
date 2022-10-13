/**
 * This method converts a regex to a string.
 * It will remove all modifiers/flags.
 *
 * @param regex The regex that should be converted to a string.
 * @returns Regex as a string.
 */
export const convertRegexToString = (regex: RegExp): string => {
  const regexString = regex.toString();
  return regexString.slice(1, regexString.lastIndexOf("/"));
};
