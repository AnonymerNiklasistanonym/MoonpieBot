/**
 * Custom error interface with an optional error code.
 */
export interface ErrorWithCode extends Error {
  code?: string;
}
