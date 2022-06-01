import type { Logger } from "winston";

export interface LoggerDatabaseOptions {
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

export const loggerCommandReply = (
  logger: Logger,
  messageId: string,
  sentMessage: string[],
  commandId: string
) => {
  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId }
  );
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
  MESSAGE_ID_UNDEFINED = "MESSAGE_ID_UNDEFINED",
  USER_NAME_UNDEFINED = "USER_NAME_UNDEFINED",
  USER_ID_UNDEFINED = "USER_ID_UNDEFINED",
}

export interface CommandError extends Error {
  code?: CommandErrorCode;
}

export const errorMessageIdUndefined = () => {
  const error: CommandError = Error(
    "Unable to reply to message! (messageId is undefined)"
  );
  error.code = CommandErrorCode.MESSAGE_ID_UNDEFINED;
  return error;
};

export const errorMessageUserNameUndefined = () => {
  const error: CommandError = Error(
    "Unable to reply to message! (userName is undefined)"
  );
  error.code = CommandErrorCode.USER_NAME_UNDEFINED;
  return error;
};

export const errorMessageUserIdUndefined = () => {
  const error: CommandError = Error(
    "Unable to reply to message! (userId is undefined)"
  );
  error.code = CommandErrorCode.USER_ID_UNDEFINED;
  return error;
};
