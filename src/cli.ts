/**
 * Command line interface handling
 */

export const CliVariablePrefix = "MOONPIE_CONFIG_";

export enum CliVariable {
  TWITCH_CHANNELS = "TWITCH_CHANNELS",
  TWITCH_NAME = "TWITCH_NAME",
  TWITCH_OAUTH_TOKEN = "TWITCH_OAUTH_TOKEN",
  DIR_LOGS = "DIR_LOGS",
  CONSOLE_LOG_LEVEL = "CONSOLE_LOG_LEVEL",
  FILE_LOG_LEVEL = "FILE_LOG_LEVEL",
  DB_FILEPATH = "DB_FILEPATH",
  OSU_CLIENT_ID = "OSU_CLIENT_ID",
  OSU_CLIENT_SECRET = "OSU_CLIENT_SECRET",
  OSU_DEFAULT_ID = "OSU_DEFAULT_ID",
  OSU_RECOGNIZE_MAPS = "OSU_RECOGNIZE_MAPS",
  TWITCH_CLIENT_ID = "TWITCH_CLIENT_ID",
  TWITCH_CLIENT_SECRET = "TWITCH_CLIENT_SECRET",
}

export const printCliVariablesToConsole = () => {
  for (const cliVariable in CliVariable) {
    const cliVariableName = `${CliVariablePrefix}${cliVariable.toString()}`;
    // eslint-disable-next-line security/detect-object-injection
    const cliVariableValue = process.env[cliVariableName];
    console.log(
      `${CliVariablePrefix}${cliVariable.toString()}=${
        cliVariableValue === undefined
          ? "not found!"
          : cliVariableValue.length === 0
          ? "empty string!"
          : '"' + cliVariableValue + '"'
      }`
    );
  }
};

export const getCliVariableValue = (
  cliVariable: CliVariable
): string | undefined => {
  return process.env[getCliVariableName(cliVariable)];
};

export const getCliVariableValueDefault = <T>(
  cliVariable: CliVariable,
  defaultValue: T
): string | T => {
  const value = process.env[getCliVariableName(cliVariable)];
  if (value === undefined || value.trim().length === 0) {
    return defaultValue;
  }
  return value;
};

export const getCliVariableName = (cliVariable: CliVariable): string => {
  return `${CliVariablePrefix}${cliVariable.toString()}`;
};
