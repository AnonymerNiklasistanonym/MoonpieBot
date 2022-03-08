const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getMacroArgs = (macroContent: string) => {
  return [...macroContent.matchAll(/-([^-]+)/g)].map((a) => a[1]);
};

export const parseMessage = (
  message: string,
  regexGroups: RegExpMatchArray,
  count: number,
  userName: string
): string => {
  return message.replace(/\$\((.*?)\)/g, (macroContent, ...groups) => {
    if (groups[0] !== undefined && typeof groups[0] === "string") {
      const macroArgs = getMacroArgs(groups[0]);
      if (groups[0] === "count") {
        return `${count}`;
      }
      if (groups[0].startsWith("random")) {
        if (macroArgs.length === 0) {
          return `${randomIntFromInterval(0, 100)}`;
        }
        if (macroArgs.length === 1) {
          return `${randomIntFromInterval(0, parseInt(macroArgs[0]))}`;
        }
        if (macroArgs.length === 2) {
          return `${randomIntFromInterval(
            parseInt(macroArgs[0]),
            parseInt(macroArgs[1])
          )}`;
        }
        return "[ERROR: <random> More then 2 arguments detected]";
      }
      if (groups[0].startsWith("group")) {
        if (macroArgs.length === 0) {
          return "[ERROR: <group> No arguments detected]";
        }
        if (macroArgs.length === 1) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          return `${regexGroups[parseInt(macroArgs[0])]}`;
        }
        return "[ERROR: <group> More than 1 argument detected]";
      }
      if (groups[0] === "user") {
        return userName;
      }
      return `[ERROR: <${groups[0]}> detected but not supported]`;
    }
    return `[ERROR: Recognized macro <${macroContent}> but not group]`;
  });
};
