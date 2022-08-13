// Type imports
import type { Test } from "mocha";

export const itAllowFail = (
  title: string,
  allowFailure: boolean,
  callback: () => Promise<void>
): Test => {
  if (!allowFailure) {
    return it(title, callback);
  }
  return it(title, function (...args) {
    return Promise.resolve()
      .then(() => {
        return callback.apply(this, args as unknown as []);
      })
      .catch(() => {
        this.skip();
      });
  });
};
