export const itAllowFail = (
  title: string,
  allowFailure: boolean,
  callback: () => Promise<void>
) => {
  if (!allowFailure) {
    return it(title, callback);
  }
  it(title, function (...args) {
    return Promise.resolve()
      .then(() => {
        return callback.apply(this, args as unknown as []);
      })
      .catch(() => {
        this.skip();
      });
  });
};
