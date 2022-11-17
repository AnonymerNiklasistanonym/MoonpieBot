// Package imports
import path from "path";
// Local imports
import { EnvVariable } from "../env";
import { getEnvVariableValueOrDefault } from "../../env";
// Type imports
import type { GetConfig, GetCustomEnvValueFromConfig } from "../../config";

export interface LoggerConfig {
  logDir: string;
  logLevelConsole: string;
  logLevelFile: string;
}

export const getLoggerConfigFromEnv: GetConfig<LoggerConfig> = (configDir) => ({
  // Twitch connection
  logDir: path.resolve(
    configDir,
    getEnvVariableValueOrDefault(EnvVariable.LOGGING_DIRECTORY_PATH, configDir)
  ),
  logLevelConsole: getEnvVariableValueOrDefault(
    EnvVariable.LOGGING_CONSOLE_LOG_LEVEL,
    configDir
  ),
  logLevelFile: getEnvVariableValueOrDefault(
    EnvVariable.LOGGING_FILE_LOG_LEVEL,
    configDir
  ),
});

export const getCustomEnvValueFromLoggerConfig: GetCustomEnvValueFromConfig<
  LoggerConfig
> = (envVariable, config) => {
  if (envVariable === EnvVariable.LOGGING_DIRECTORY_PATH) {
    return config.logDir;
  }
  if (envVariable === EnvVariable.LOGGING_CONSOLE_LOG_LEVEL) {
    return config.logLevelConsole;
  }
  if (envVariable === EnvVariable.LOGGING_FILE_LOG_LEVEL) {
    return config.logLevelFile;
  }
  return undefined;
};
