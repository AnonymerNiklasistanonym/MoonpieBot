const hasWhiteSpace = (str: string): boolean => /\s/g.test(str);

export interface EscapeStringIfWhiteSpaceOptions {
  escapeCharacters?: Readonly<[string | Readonly<RegExp>, string][]>;
  surroundCharacter: string;
}
export const escapeStringIfWhiteSpace = (
  str: string,
  options: Readonly<EscapeStringIfWhiteSpaceOptions> = {
    escapeCharacters: [
      ["\\", "\\\\"],
      // eslint-disable-next-line @typescript-eslint/quotes
      ['"', '\\"'],
      ["$", "\\$"],
    ],
    // eslint-disable-next-line @typescript-eslint/quotes
    surroundCharacter: '"',
  },
): string => {
  if (!hasWhiteSpace(str) && str.length > 0) {
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

export const escapeWhitespaceEnvVariableValue = (str: string): string =>
  escapeStringIfWhiteSpace(str, {
    escapeCharacters: [["'", "\\'"]],
    surroundCharacter: "'",
  });

export const escapeWhitespaceChatCommandGroup = (str: string): string =>
  escapeStringIfWhiteSpace(str, {
    escapeCharacters: [["'", "\\'"]],
    surroundCharacter: "'",
  });

export const removeWhitespaceEscapeChatCommandGroup = (str: string): string =>
  str.startsWith("'") && str.endsWith("'")
    ? str.substring(1, str.length - 1)
    : str;
