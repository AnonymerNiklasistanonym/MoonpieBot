export const hasWhiteSpace = (str: string): boolean => /\s/g.test(str);

export interface EscapeStringIfWhiteSpaceOptions {
  escapeCharacters?: [string | RegExp, string][];
  surroundCharacter: string;
}
export const escapeStringIfWhiteSpace = (
  str: string,
  options: EscapeStringIfWhiteSpaceOptions = {
    escapeCharacters: [
      ["\\", "\\\\"],
      // eslint-disable-next-line @typescript-eslint/quotes
      ['"', '\\"'],
      ["$", "\\$"],
    ],
    // eslint-disable-next-line @typescript-eslint/quotes
    surroundCharacter: '"',
  }
): string => {
  if (!hasWhiteSpace(str)) {
    return str;
  }
  if (options.escapeCharacters === undefined) {
    return `${options.surroundCharacter}${str}${options.surroundCharacter}`;
  }
  let escapedString = str;
  for (const [escapeCharacter, replaceCharacter] of options.escapeCharacters) {
    escapedString = escapedString.replaceAll(escapeCharacter, replaceCharacter);
  }
  return `${options.surroundCharacter}${escapedString}${options.surroundCharacter}`;
};
