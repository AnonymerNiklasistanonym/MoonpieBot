/**
 * Predicate with type guard that can be inserted into a filter() call to remove
 * undefined values from the array.
 *
 * @param value Any value.
 * @returns True if not undefined.
 */
export const notUndefined = <TValue>(
  value: TValue | undefined
): value is TValue => {
  return value !== undefined;
};

/**
 * Type that describes a not undefined but empty object.
 */
export type EMPTY_OBJECT = Record<never, never>;
