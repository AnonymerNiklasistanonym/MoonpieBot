/** Custom error interface with an optional error code. */
export interface ErrorWithCode extends Error {
  code?: ErrorWithCodeCode;
}

/** Custom error codes. */
export enum ErrorWithCodeCode {
  ENABLED_COMMANDS_UNDEFINED = "ENABLED_COMMANDS_UNDEFINED",
  MESSAGE_ID_UNDEFINED = "MESSAGE_ID_UNDEFINED",
  OSU_API_V2_DEFAULT_OSU_ID_UNDEFINED = "OSU_API_V2_DEFAULT_OSU_ID_UNDEFINED",
  USER_ID_UNDEFINED = "USER_ID_UNDEFINED",
  USER_NAME_UNDEFINED = "USER_NAME_UNDEFINED",
}

/**
 * @returns Error for when the message ID of a Twitch message is undefined.
 */
export const errorMessageIdUndefined = (): ErrorWithCode => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (messageId is undefined)",
  );
  error.code = ErrorWithCodeCode.MESSAGE_ID_UNDEFINED;
  return error;
};

/**
 * @returns Error for when the message user name of a Twitch message is undefined.
 */
export const errorMessageUserNameUndefined = (): ErrorWithCode => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (userName is undefined)",
  );
  error.code = ErrorWithCodeCode.USER_NAME_UNDEFINED;
  return error;
};

/**
 * @returns Error for when the message user ID of a Twitch message is undefined.
 */
export const errorMessageUserIdUndefined = (): ErrorWithCode => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (userId is undefined)",
  );
  error.code = ErrorWithCodeCode.USER_ID_UNDEFINED;
  return error;
};

/**
 * @returns Error for when the default osu user ID of a Twitch message is undefined.
 */
export const errorMessageDefaultOsuIdUndefined = (): ErrorWithCode => {
  const error: ErrorWithCode = Error(
    "Unable to reply to message! (defaultOsuId is undefined)",
  );
  error.code = ErrorWithCodeCode.OSU_API_V2_DEFAULT_OSU_ID_UNDEFINED;
  return error;
};
