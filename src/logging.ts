import {
  createLogger as createWinstonLogger,
  transports,
  format,
} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { name } from "./info";

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

/**
 * Create a global logger.
 *
 * @param logDir The directory to log to.
 * @param logLevelConsole The log level of the console logger.
 * @param logLevelFile The log level of the file logger.
 * @returns Logger.
 */
export const createLogger = (
  logDir: string,
  logLevelConsole: LoggerLevel | string = "info",
  logLevelFile: LoggerLevel | string = "debug"
) => {
  return createWinstonLogger({
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
    format: format.combine(
      format.timestamp(),
      format.printf((logInfo: LoggerInformation) => {
        if (logInfo.timestamp !== undefined && logInfo.service !== undefined) {
          if (logInfo.section !== undefined) {
            if (logInfo.subsection !== undefined) {
              return `[${logInfo.timestamp}] ${logInfo.service}#${logInfo.section}#${logInfo.subsection} ${logInfo.level}: ${logInfo.message}`;
            }
            return `[${logInfo.timestamp}] ${logInfo.service}#${logInfo.section} ${logInfo.level}: ${logInfo.message}`;
          }
          return `[${logInfo.timestamp}] ${logInfo.service} ${logInfo.level}: ${logInfo.message}`;
        }
        return `${logInfo.level}: ${logInfo.message}`;
      })
    ),
    defaultMeta: {
      service: `${name}`,
    },
  });
};
