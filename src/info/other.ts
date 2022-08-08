export const NOT_FOUND_STATUS_CODE = 404;

export const notUndefined = <TValue>(
  value: TValue | undefined
): value is TValue => {
  return value !== undefined;
};
