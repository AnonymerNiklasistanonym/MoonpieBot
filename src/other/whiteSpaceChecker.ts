export const hasWhiteSpace = (str: string): boolean => /\s/g.test(str);
export const escapeStringIfWhiteSpace = (str: string): string => {
  if (hasWhiteSpace(str)) {
    return `"${str}"`;
  }
  return str;
};
