/**
 * Predicate with type guard that can be inserted into a filter() call to remove
 * undefined values from the array.
 *
 * @param value Any value.
 * @returns True if not undefined.
 */
export const notUndefined = <TValue>(
  value: Readonly<TValue> | undefined
): value is TValue => value !== undefined;

/**
 * Convert a value to a custom value if undefined.
 *
 * @param value Any value.
 * @param customValue Custom value to be used if value undefined.
 * @returns Custom value if undefined otherwise the value.
 */
export const convertUndefinedToCustomValue = <TValue, TCustomValue>(
  value: Readonly<TValue> | undefined,
  customValue: Readonly<TCustomValue>
): TValue | TCustomValue => (value === undefined ? customValue : value);

/**
 * Type that describes a not undefined but empty object.
 */
export type EMPTY_OBJECT = Record<never, never>;

/**
 * Type that makes a whole object readonly.
 *
 * (Source: https://github.com/microsoft/TypeScript/issues/10725#issuecomment-699193070).
 */
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

/**
 * Type that represents the input type or the input type in a promise.
 */
export type OrPromise<TYPE> = TYPE | Promise<TYPE>;

/**
 * Type that represents the input type or the input type as an array.
 */
export type OrArray<TYPE> = TYPE | TYPE[];
