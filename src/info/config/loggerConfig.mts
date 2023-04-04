// Package imports
import path from "path";
// Relative imports
import { EnvVariable } from "../env.mjs";
import { getEnvVariableValueOrDefault } from "../../env.mjs";
import { LoggerLevel } from "../../logging.mjs";
// Type imports
import type { GetConfig, GetCustomEnvValueFromConfig } from "../../config.mjs";

export interface LoggerConfig {
  logDir: string;
  logLevelConsole: LoggerLevel;
  logLevelFile: LoggerLevel;
}

const getLoggerLevelFromString = (loggerLevel: string): LoggerLevel => {
  const parsedLoggerLevel = Object.values(LoggerLevel).find(
    (a) => a === loggerLevel.toLowerCase(),
  );
  if (parsedLoggerLevel) {
    return parsedLoggerLevel;
  }
  throw Error(
    `Logger level '${loggerLevel}' is not supported! (${Object.values(
      LoggerLevel,
    ).join(", ")})`,
  );
};

export const getLoggerConfigFromEnv: GetConfig<LoggerConfig> = (configDir) => ({
  // Twitch connection
  logDir: path.resolve(
    configDir,
    getEnvVariableValueOrDefault(EnvVariable.LOGGING_DIRECTORY_PATH, configDir),
  ),
  logLevelConsole: getLoggerLevelFromString(
    getEnvVariableValueOrDefault(
      EnvVariable.LOGGING_CONSOLE_LOG_LEVEL,
      configDir,
    ),
  ),
  logLevelFile: getLoggerLevelFromString(
    getEnvVariableValueOrDefault(EnvVariable.LOGGING_FILE_LOG_LEVEL, configDir),
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
