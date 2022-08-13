/**
 * Asynchronous rewrite of the synchronous string.replace(regex, callback)
 * function.
 *
 * @param message The string that should be replaced.
 * @param regex The regex that is used to check what should be replaced.
 * @param callback The callback function that evaluates how to replace.
 * @returns A new string with the replaced data.
 */
export const asyncReplace = async (
  message: string,
  regex: RegExp,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (substring: string, ...groups: any[]) => Promise<string>
): Promise<string> => {
  // Since the replace function is not async first all the replace data must be
  // collected in an array:
  const replaceData: Promise<string>[] = [];
  message.replace(regex, (substring, ...groups): string => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    replaceData.push(callback(substring, ...groups));
    return "";
  });
  // Now all async requests are being awaited:
  const awaitedReplaceData = await Promise.all(replaceData);
  // If none are pending any more redo the replace but insert the awaited data:
  let index = 0;
  return message.replace(regex, () => awaitedReplaceData[index++]);
};
