// Package imports
import {
  createLogger as createWinstonLogger,
  format,
  transports,
} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
// Type imports
import type { Logger } from "winston";

/**
 * The default log levels of the logger.
 */
export type LoggerLevel = "error" | "warn" | "debug" | "info";

/**
 * The information the logger stores.
 */
export interface LoggerInformation {
  level: LoggerLevel | string;
  message: string;
  timestamp?: string;
  service?: string;
  section?: string;
  subsection?: string;
}

export const logFormat = (logInfo: LoggerInformation) => {
  if (logInfo.timestamp && logInfo.service) {
    if (logInfo.section) {
      if (logInfo.subsection) {
        return `[${logInfo.timestamp}] ${logInfo.service}#${logInfo.section}#${logInfo.subsection} ${logInfo.level}: ${logInfo.message}`;
      }
      return `[${logInfo.timestamp}] ${logInfo.service}#${logInfo.section} ${logInfo.level}: ${logInfo.message}`;
    }
    return `[${logInfo.timestamp}] ${logInfo.service} ${logInfo.level}: ${logInfo.message}`;
  }
  return `${logInfo.level}: ${logInfo.message}`;
};

/**
 * Create a global logger.
 *
 * @param name The name of the logger.
 * @param logDir The directory to log to.
 * @param logLevelConsole The log level of the console logger.
 * @param logLevelFile The log level of the file logger.
 * @returns Logger.
 */
export const createLogger = (
  name: string,
  logDir: string,
  logLevelConsole: LoggerLevel | string = "info",
  logLevelFile: LoggerLevel | string = "debug"
) =>
  createWinstonLogger({
    exitOnError: false,
    transports: [
      new DailyRotateFile({
        dirname: logDir,
        filename: `${name.toLowerCase()}-%DATE%.log`,
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: false,
        maxSize: "100m",
        maxFiles: "28d",
        level: logLevelFile,
      }),
      new transports.Console({ level: logLevelConsole }),
    ],
    format: format.combine(format.timestamp(), format.printf(logFormat)),
    defaultMeta: {
      service: name,
    },
  });

export interface LogMessageInfo {
  subsection?: string;
}

export interface LogFunc {
  info: (message: string) => void;
  debug: (message: string) => void;
  warn: (message: string) => void;
  error: (err: Error) => void;
}

/**
 * Create a function that will log messages with a hardcoded section.
 *
 * @param logger The logger.
 * @param section The section which the log function should log.
 * @param info Additional log information like a subsection.
 * @returns Log function with hardcoded section.
 */
export const createLogFunc = (
  logger: Logger,
  section: string,
  info: LogMessageInfo = {}
): LogFunc => {
  const subsection = info.subsection ? info.subsection : undefined;
  const baseLogFunc = (level: LoggerLevel) => {
    return (message: string) => {
      logger.log({ level, message, section, subsection });
    };
  };
  return {
    info: baseLogFunc("info"),
    debug: baseLogFunc("debug"),
    warn: baseLogFunc("warn"),
    error: (err: Error) => {
      logger.log({ level: "error", message: err.message, section, subsection });
    },
  };
};

/**
 * Helper method for consistent and helpful type guard check warnings.
 *
 * @param expectedMessage The type guard message about what is weird.
 * @param value The value that is currently being checked.
 * @param property The name of the property that is being checked.
 * @param index The index of the property that is being checked in an array.
 * @returns String that contains information about the property and what is bad plus its actual value and how it looks like.
 */
export const typeGuardLog = <T>(
  expectedMessage: string,
  value: T,
  property?: string,
  index?: number
) =>
  `${
    property ? `'${property}'${index !== undefined ? `[${index}]` : ""}: ` : ""
  }expected ${expectedMessage} ('${typeof value}'/'${JSON.stringify(value)}')`;
