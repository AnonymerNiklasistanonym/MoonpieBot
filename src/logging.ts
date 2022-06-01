import {
  createLogger as createWinstonLogger,
  transports,
  format,
  Logger,
} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { name } from "./info";

export interface LoggerInformation {
  level: string;
  message: string;
  timestamp?: string;
  service?: string;
  section?: string;
  subsection?: string;
}

export const createLogger = (
  logDir: string,
  logLevelConsole: "error" | "warn" | "debug" | "info" = "info",
  logLevelFile: "error" | "warn" | "debug" | "info" = "debug"
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
      format.printf(
        ({ timestamp, level, message, service, section, subsection }) => {
          if (timestamp !== undefined && service !== undefined) {
            if (section !== undefined) {
              if (subsection !== undefined) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return `[${timestamp}] ${service}#${section}#${subsection} ${level}: ${message}`;
              }
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              return `[${timestamp}] ${service}#${section} ${level}: ${message}`;
            }
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return `[${timestamp}] ${service} ${level}: ${message}`;
          }
          return `${level}: ${message}`;
        }
      )
    ),
    defaultMeta: {
      service: `${name}`,
    },
  });
};

export interface LogTwitchMessageOptions {
  subsection?: string;
}

export const logTwitchMessage = (
  logger: Logger,
  message: string,
  options?: LogTwitchMessageOptions
) => {
  logger.log({
    level: "debug",
    message: message,
    section: "twitch_message",
    subsection: options?.subsection,
  });
};

export const logTwitchMessageReply = (
  logger: Logger,
  messageId: string,
  sentMessage: string[],
  replyId: string
) => {
  logTwitchMessage(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { subsection: replyId }
  );
};

export const logTwitchMessageBroadcast = (
  logger: Logger,
  sentMessage: string[],
  sourceId: string
) => {
  logTwitchMessage(
    logger,
    `Successfully sent: '${JSON.stringify(sentMessage)}'`,
    {
      subsection: sourceId,
    }
  );
};
