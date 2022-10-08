/**
 * File path information.
 */

const EXAMPLE_SUFFIX = ".example";

/** The file name of the file that contains ENV variable values. */
export const fileNameEnv = ".env";
/** The example file of {@link fileNameEnv}. */
export const fileNameEnvExample = `${fileNameEnv}${EXAMPLE_SUFFIX}`;
/** The file name of the file that contains ENV variable values for custom strings. */
export const fileNameEnvStrings = `${fileNameEnv}.strings`;
/** The example file of {@link fileNameEnvStrings}. */
export const fileNameEnvStringsExample = `${fileNameEnvStrings}${EXAMPLE_SUFFIX}`;

/** The file name of the file that contains examples for custom commands and broadcasts. */
export const fileNameCustomCommandsBroadcastsExample =
  "customCommandsBroadcasts.example.txt";

/**
 * A function to create the filename for the moonpie database backups depending
 * on the current day.
 *
 * @param date The current date.
 * @returns The file name.
 */
export const generateOutputFileNameMoonpieDbBackup = (
  date: Date = new Date()
): string => {
  const PAD_DAY_MONTH_TO_2_DIGITS_FACTOR = 2;
  const dateDay = `0${date.getDate()}`.slice(-PAD_DAY_MONTH_TO_2_DIGITS_FACTOR);
  const DateMonth = `0${date.getMonth() + 1}`.slice(
    -PAD_DAY_MONTH_TO_2_DIGITS_FACTOR
  );
  const dateYear = date.getFullYear();
  return `db_backup_moonpie_${dateYear}-${DateMonth}-${dateDay}.json`;
};
