// Package imports
import { deprecate } from "util";
// Local imports
import { logTwitchMessageDetected, logTwitchMessageReply } from "./twitch";
// Type imports
import type { Logger } from "winston";

export const logTwitchMessageCommandReply = deprecate(
  (
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
  },
  "Stop using this function pls"
);

export const logTwitchMessageCommandDetected = (
  logger: Logger,
  messageId: string | undefined,
  message: string[],
  commandId: string,
  subcommandId: string,
  detectorId?: string
) => {
  logTwitchMessageDetected(
    logger,
    messageId === undefined ? "ERROR:UNDEFINED" : messageId,
    message,
    `'${commandId}:${subcommandId}'`,
    detectorId ? detectorId : "TODO"
  );
};

export enum CommandErrorCode {
  MESSAGE_ID_UNDEFINED = "MESSAGE_ID_UNDEFINED",
  USER_NAME_UNDEFINED = "USER_NAME_UNDEFINED",
  USER_ID_UNDEFINED = "USER_ID_UNDEFINED",
  ENABLED_COMMANDS_UNDEFINED = "ENABLED_COMMANDS_UNDEFINED",
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

export const errorMessageEnabledCommandsUndefined = () => {
  const error: CommandError = Error(
    "Unable to detect message! (enabled commands is undefined)"
  );
  error.code = CommandErrorCode.ENABLED_COMMANDS_UNDEFINED;
  return error;
};
