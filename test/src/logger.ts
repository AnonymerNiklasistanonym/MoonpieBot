/* eslint-disable @typescript-eslint/restrict-template-expressions */
import winston, { format } from "winston";

export const getTestLogger = (testName: string) =>
  winston.createLogger({
    level: "warn",
    transports: [new winston.transports.Console()],
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
      service: `MoonpieBotTest${testName}`,
    },
  });
