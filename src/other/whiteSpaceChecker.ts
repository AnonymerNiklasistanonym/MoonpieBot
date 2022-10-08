export const hasWhiteSpace = (str: string): boolean => /\s/g.test(str);
export const escapeStringIfWhiteSpace = (
  str: string,
  // eslint-disable-next-line @typescript-eslint/quotes
  escapeCharacter = '"'
): string => {
  if (hasWhiteSpace(str)) {
    return `${escapeCharacter}${str}${escapeCharacter}`;
  }
  return str;
};
