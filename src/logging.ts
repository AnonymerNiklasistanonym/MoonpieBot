/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  createLogger as createWinstonLogger,
  transports,
  format,
} from "winston";

export const createLogger = (filePath = "./moonpiebot.log") => {
  return createWinstonLogger({
    transports: [
      new transports.File({
        dirname: "logs",
        filename: filePath,
        level: "debug",
      }),
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
