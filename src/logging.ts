/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  createLogger as createWinstonLogger,
  transports,
  format,
} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const createLogger = () => {
  return createWinstonLogger({
    transports: [
      new DailyRotateFile({
        dirname: "logs",
        filename: "moonpiebot-%DATE%.log",
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: false,
        maxSize: "100m",
        maxFiles: "28d",
        level: "debug",
      }),
      //new transports.File({
      //  dirname: "logs",
      //  filename: filePath,
      //  level: "debug",
      //}),
      new transports.Console({ level: "info" }),
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
      service: "MoonpieBot",
    },
  });
};
