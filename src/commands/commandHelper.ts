import type { Logger } from "winston";

interface LoggerDatabaseOptions {
  commandId?: string;
}

export const loggerCommand = (
  logger: Logger,
  message: string,
  options?: LoggerDatabaseOptions
) => {
  logger.log({
    level: "debug",
    message: message,
    section: "command",
    subsection: options?.commandId,
  });
};

export const loggerCommandError = (
  logger: Logger,
  message: string,
  error: Error,
  options?: LoggerDatabaseOptions
) => {
  logger.log({
    level: "error",
    message: `${message}: ${error.message}`,
    section: "command",
    subsection: options?.commandId,
  });
};

export enum CommandErrorCode {
  MESSADE_ID_UNDEFINED = "MESSADE_ID_UNDEFINED",
}

export interface CommandError extends Error {
  code?: CommandErrorCode;
}

export const errorMessageIdUndefined = () => {
  const error: CommandError = Error(
    "Unable to reply to message! (messageId is undefined)"
  );
  error.code = CommandErrorCode.MESSADE_ID_UNDEFINED;
  return error;
};
