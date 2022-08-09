import path from "path";

const EXAMPLE_SUFFIX = ".example";

export const fileNameEnv = ".env";
export const fileNameEnvExample = `${fileNameEnv}${EXAMPLE_SUFFIX}`;
export const fileNameEnvStrings = `${fileNameEnv}.strings`;
export const fileNameEnvStringsExample = `${fileNameEnvStrings}${EXAMPLE_SUFFIX}`;

const customCommandsString = "customCommands";
const customTimersString = "customTimers";

const JSON_SCHEMA_SUFFIX = ".schema";

export const fileNameCustomCommands = `${customCommandsString}.json`;
export const fileNameCustomTimers = `${customTimersString}.json`;
export const fileNameCustomCommandsExample = `${customCommandsString}${EXAMPLE_SUFFIX}.json`;
export const fileNameCustomTimersExample = `${customTimersString}${EXAMPLE_SUFFIX}.json`;
export const fileNameCustomCommandsSchema = `${customCommandsString}${JSON_SCHEMA_SUFFIX}.json`;
export const fileNameCustomTimersSchema = `${customTimersString}${JSON_SCHEMA_SUFFIX}.json`;

export const fileNameManPage = path.join("installer", "man.md");

export const fileNameDatabaseBackups = (date: Date = new Date()) => {
  const PAD_DAY_MONTH_TO_2_DIGITS_FACTOR = 2;
  const dateDay = `0${date.getDate()}`.slice(-PAD_DAY_MONTH_TO_2_DIGITS_FACTOR);
  const DateMonth = `0${date.getMonth() + 1}`.slice(
    -PAD_DAY_MONTH_TO_2_DIGITS_FACTOR
  );
  const dateYear = date.getFullYear();
  return `db_backup_moonpie_${dateYear}-${DateMonth}-${dateDay}.json`;
};
