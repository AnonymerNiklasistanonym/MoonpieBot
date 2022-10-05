export const parseRegexStringArgumentUndef = (
  regexStringArg?: string
): string | undefined => {
  if (regexStringArg !== undefined) {
    return parseRegexStringArgument(regexStringArg);
  }
  return regexStringArg;
};

export const parseRegexStringArgument = (regexStringArg: string): string => {
  if (regexStringArg.startsWith("'") && regexStringArg.endsWith("'")) {
    return regexStringArg.substring(1, regexStringArg.length - 1);
  }
  return regexStringArg;
};
