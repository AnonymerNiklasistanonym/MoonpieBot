/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  createLogger as createWinstonLogger,
  transports,
  format,
} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { name } from "./info";

export const createLogger = (
  logDir: string,
  logLevelConsole: "error" | "warn" | "debug" | "info" = "info",
  logLevelFile: "error" | "warn" | "debug" | "info" = "debug"
) => {
  return createWinstonLogger({
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
      format.printf(
        ({ timestamp, level, message, service, section, subsection }) => {
          if (section !== undefined) {
            if (subsection !== undefined) {
              return `[${timestamp}] ${service}#${section}#${subsection} ${level}: ${message}`;
            }
            return `[${timestamp}] ${service}#${section} ${level}: ${message}`;
          }
          return `[${timestamp}] ${service} ${level}: ${message}`;
        }
      )
    ),
    defaultMeta: {
      service: `${name}`,
    },
  });
};
