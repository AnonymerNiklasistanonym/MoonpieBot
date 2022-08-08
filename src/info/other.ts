export const NOT_FOUND_STATUS_CODE = 404;

export const MAX_LENGTH_OF_A_TWITCH_MESSAGE = 499;

export const notUndefined = <TValue>(
  value: TValue | undefined
): value is TValue => {
  return value !== undefined;
};
