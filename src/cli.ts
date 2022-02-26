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

export const getCliVariableValue = (cliVariable: CliVariable) => {
  return process.env[getCliVariableName(cliVariable)];
};

export const getCliVariableName = (cliVariable: CliVariable): string => {
  return `${CliVariablePrefix}${cliVariable.toString()}`;
};
