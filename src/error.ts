/**
 * Custom error interface with an optional error code.
 */
export interface ErrorWithCode extends Error {
  code?: string;
}

export enum ErrorWithCodeCode {
  ENABLED_COMMANDS_UNDEFINED = "ENABLED_COMMANDS_UNDEFINED",
  MESSAGE_ID_UNDEFINED = "MESSAGE_ID_UNDEFINED",
  OSU_API_V2_CREDENTIALS_UNDEFINED = "OSU_API_V2_CREDENTIALS_UNDEFINED",
  USER_ID_UNDEFINED = "USER_ID_UNDEFINED",
  USER_NAME_UNDEFINED = "USER_NAME_UNDEFINED",
}

export const errorMessageIdUndefined = () => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (messageId is undefined)"
  );
  error.code = ErrorWithCodeCode.MESSAGE_ID_UNDEFINED;
  return error;
};

export const errorMessageUserNameUndefined = () => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (userName is undefined)"
  );
  error.code = ErrorWithCodeCode.USER_NAME_UNDEFINED;
  return error;
};

export const errorMessageUserIdUndefined = () => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (userId is undefined)"
  );
  error.code = ErrorWithCodeCode.USER_ID_UNDEFINED;
  return error;
};

export const errorMessageEnabledCommandsUndefined = () => {
  const error: ErrorWithCode = Error(
    "Unable to detect message! (enabled commands is undefined)"
  );
  error.code = ErrorWithCodeCode.ENABLED_COMMANDS_UNDEFINED;
  return error;
};

export const errorMessageOsuApiCredentialsUndefined = () => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (osuApiV2Credentials is undefined)"
  );
  error.code = ErrorWithCodeCode.OSU_API_V2_CREDENTIALS_UNDEFINED;
  return error;
};
