import type { Logger } from "winston";
import { logTwitchMessageReply } from "./logging";

export const logTwitchMessageCommandReply = (
  logger: Logger,
  messageId: string,
  sentMessage: string[],
  commandId: string,
  subcommandId: string
) => {
  logTwitchMessageReply(
    logger,
    messageId,
    sentMessage,
    `${commandId}:${subcommandId}`
  );
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
