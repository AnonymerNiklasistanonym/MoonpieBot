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
export enum LoggerLevel {
  DEBUG = "debug",
  ERROR = "error",
  INFO = "info",
  WARN = "warn",
}

/**
 * The information the logger stores.
 */
export interface LoggerInformation {
  level: LoggerLevel | string;
  message: string;
  section?: string;
  service?: string;
  subsection?: string;
  timestamp?: string;
}

/**
 * Function that formats the log output.
 *
 * @param logInfo The information the logger provides.
 * @returns Parsed string.
 */
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
    defaultMeta: { service: name },
    exitOnError: false,
    format: format.combine(format.timestamp(), format.printf(logFormat)),
    transports: [
      new DailyRotateFile({
        datePattern: "YYYY-MM-DD-HH",
        dirname: logDir,
        filename: `${name.toLowerCase()}-%DATE%.log`,
        level: logLevelFile,
        maxFiles: "28d",
        maxSize: "100m",
        zippedArchive: false,
      }),
      new transports.Console({ level: logLevelConsole }),
    ],
  });

/**
 * Create a global logger.
 *
 * @param name The name of the logger.
 * @param logLevelConsole The log level of the console logger.
 * @returns Logger.
 */
export const createConsoleLogger = (
  name: string,
  logLevelConsole: LoggerLevel | string = "info"
) =>
  createWinstonLogger({
    defaultMeta: { service: name },
    exitOnError: false,
    format: format.combine(format.timestamp(), format.printf(logFormat)),
    transports: [new transports.Console({ level: logLevelConsole })],
  });

/**
 * The log function object returned when creating a log function with section
 * information.
 */
export interface LogFunc {
  debug: (message: string) => void;
  error: (err: Error) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
}

/**
 * Create a function that will log messages with a hardcoded section.
 *
 * @param logger The logger.
 * @param section The section which the log function should log.
 * @param subsection Additional section information (subsection).
 * @returns Log function with hardcoded section.
 */
export const createLogFunc = (
  logger: Logger,
  section: string,
  subsection?: string
): LogFunc => {
  const baseLogFunc = (level: LoggerLevel) => (message: string) => {
    logger.log({ level, message, section, subsection });
  };
  return {
    debug: baseLogFunc(LoggerLevel.DEBUG),
    error: (err: Error) => {
      logger.log({ level: "error", message: err.message, section, subsection });
    },
    info: baseLogFunc(LoggerLevel.INFO),
    warn: baseLogFunc(LoggerLevel.WARN),
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
