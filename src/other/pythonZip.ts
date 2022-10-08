/** (Source: https://dev.to/chrismilson/zip-iterator-in-typescript-ldm). */
export type Iterableify<T> = { [K in keyof T]: Iterable<T[K]> };

/**
 * Python zip generator function.
 *
 * (Source: https://dev.to/chrismilson/zip-iterator-in-typescript-ldm).
 *
 * @param toZip The arrays that should be zipped.
 * @yields Both arrays merged into one array.
 */
function* zip<T extends Array<unknown>>(
  ...toZip: Iterableify<T>
): Generator<T> {
  // Get iterators for all of the iterables.
  const iterators = toZip.map((i) => i[Symbol.iterator]());

  while (true) {
    // Advance all of the iterators.
    const results = iterators.map((i) => i.next());

    // If any of the iterators are done, we should stop.
    if (results.some(({ done }) => done)) {
      break;
    }

    // We can assert the yield type, since we know none
    // of the iterators are done.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    yield results.map(({ value }) => value) as T;
  }
}

export { zip };
