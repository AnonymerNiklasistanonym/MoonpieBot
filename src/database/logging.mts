// Package imports
import { LogLevel } from "sqlite3-promise-query-api";
// Type imports
import type { Logger } from "sqlite3-promise-query-api";
import type { Logger as WinstonLogger } from "winston";

export const createLogMethod =
  (logger: WinstonLogger, section: string): Logger =>
  (logLevel, logMessage, logSection) =>
    logger.log({
      level: logLevel === LogLevel.SQL ? LogLevel.DEBUG : logLevel,
      message: logMessage instanceof Error ? logMessage.message : logMessage,
      section,
      subsection: logSection + (logLevel === LogLevel.SQL ? ":sql" : ""),
    });
