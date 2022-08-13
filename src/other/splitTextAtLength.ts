/**
 * Split text input into an array of text that never exceeds the split length
 * while also not breaking words off.
 *
 * @param textInput The text that should be split.
 * @param splitLength The maximum length of each text string in the output array.
 * @returns Array of text strings that never exceed the split length.
 */
export const splitTextAtLength = (
  textInput: string,
  splitLength: number
): string[] => {
  const allWords = textInput.split(" ");
  const out = [""];
  let first = true;
  for (const word of allWords) {
    if (out[out.length - 1].length + 1 + word.length > splitLength) {
      out.push(word);
    } else {
      out[out.length - 1] += `${first ? "" : " "}${word}`;
      first = false;
    }
  }
  return out;
};

export enum FileDocumentationPartType {
  HEADING = "HEADING",
  NEWLINE = "NEWLINE",
  TEXT = "TEXT",
  VALUE = "VALUE",
}

export interface FileDocumentationPart<Type extends FileDocumentationPartType> {
  type: Type;
}
export interface FileDocumentationPartText
  extends FileDocumentationPart<FileDocumentationPartType.TEXT> {
  content: string;
  isComment?: boolean;
}
export interface FileDocumentationPartHeading
  extends FileDocumentationPart<FileDocumentationPartType.HEADING> {
  description?: string;
  title: string;
}
export interface FileDocumentationPartValue
  extends FileDocumentationPart<FileDocumentationPartType.VALUE> {
  description?: string;
  infos?: string[];
  isComment?: boolean;
  lists?: [string, string[]][];
  prefix: string;
  properties?: [string, string][];
  title?: string;
  value?: string;
}
export interface FileDocumentationPartNewline
  extends FileDocumentationPart<FileDocumentationPartType.NEWLINE> {
  count: number;
}

export type FileDocumentationParts =
  | FileDocumentationPartText
  | FileDocumentationPartHeading
  | FileDocumentationPartValue
  | FileDocumentationPartNewline;

const DEFAULT_MAX_LINE_LENGTH = 80;
const COMMENT_CHARACTER = "#";
const SPACING_CHARACTER = " ";
const LIST_CHARACTER = "-";
const DIVIDER_CHARACTER = "-";
const LIST_CHARACTER_AND_SPACING = `${LIST_CHARACTER}${SPACING_CHARACTER}`;
const COMMENT_CHARACTER_AND_SPACING = `${COMMENT_CHARACTER}${SPACING_CHARACTER}`;

export const generateFileDocumentation = (
  input: FileDocumentationParts[],
  maxLineLength = DEFAULT_MAX_LINE_LENGTH
): string => {
  let data = "";

  for (const inputPart of input) {
    switch (inputPart.type) {
      case FileDocumentationPartType.NEWLINE:
        data += "\n".repeat(inputPart.count);
        break;
      case FileDocumentationPartType.TEXT:
        data += splitTextAtLength(
          inputPart.content,
          maxLineLength -
            (inputPart.isComment
              ? COMMENT_CHARACTER.length
              : COMMENT_CHARACTER_AND_SPACING.length)
        )
          .map(
            (a) =>
              `${COMMENT_CHARACTER}${
                inputPart.isComment ? "" : SPACING_CHARACTER
              }${a}\n`
          )
          .join("");
        break;
      case FileDocumentationPartType.HEADING:
        data += COMMENT_CHARACTER.repeat(maxLineLength) + "\n";
        data += splitTextAtLength(
          inputPart.title,
          maxLineLength - COMMENT_CHARACTER_AND_SPACING.length
        )
          .map((a) => `${COMMENT_CHARACTER_AND_SPACING}${a}\n`)
          .join("");
        if (inputPart.description !== undefined) {
          data +=
            COMMENT_CHARACTER_AND_SPACING +
            DIVIDER_CHARACTER.repeat(
              maxLineLength - COMMENT_CHARACTER_AND_SPACING.length
            ) +
            "\n";
          data += splitTextAtLength(
            inputPart.description,
            maxLineLength - COMMENT_CHARACTER_AND_SPACING.length
          )
            .map((a) => `${COMMENT_CHARACTER_AND_SPACING}${a}\n`)
            .join("");
        }
        data += COMMENT_CHARACTER.repeat(maxLineLength) + "\n";
        break;
      case FileDocumentationPartType.VALUE:
        if (inputPart.title !== undefined) {
          data += `${COMMENT_CHARACTER_AND_SPACING}${inputPart.title}\n`;
        }
        if (inputPart.description !== undefined) {
          data += splitTextAtLength(
            inputPart.description,
            maxLineLength -
              COMMENT_CHARACTER_AND_SPACING.length -
              inputPart.prefix.length -
              SPACING_CHARACTER.length
          )
            .map(
              (a, index) =>
                `${COMMENT_CHARACTER_AND_SPACING}${
                  index === 0
                    ? inputPart.prefix
                    : SPACING_CHARACTER.repeat(inputPart.prefix.length)
                }${SPACING_CHARACTER}${a}\n`
            )
            .join("");
        }
        if (inputPart.lists !== undefined && inputPart.lists.length > 0) {
          for (const list of inputPart.lists) {
            data += `${COMMENT_CHARACTER_AND_SPACING}${SPACING_CHARACTER.repeat(
              inputPart.prefix.length + 1
            )}${list[0]}:\n`;
            data += list[1]
              .map(
                (a) =>
                  `${COMMENT_CHARACTER_AND_SPACING}${SPACING_CHARACTER.repeat(
                    inputPart.prefix.length + 1
                  )}${LIST_CHARACTER_AND_SPACING}${a}\n`
              )
              .join("");
          }
        }
        if (
          inputPart.properties !== undefined &&
          inputPart.properties.length > 0
        ) {
          for (const property of inputPart.properties) {
            data += `${COMMENT_CHARACTER_AND_SPACING}${SPACING_CHARACTER.repeat(
              inputPart.prefix.length
            )} ${property[0]}: ${property[1]}\n`;
          }
        }
        if (inputPart.infos !== undefined && inputPart.infos.length > 0) {
          for (const info of inputPart.infos) {
            data += `${COMMENT_CHARACTER_AND_SPACING}${SPACING_CHARACTER.repeat(
              inputPart.prefix.length
            )} ${info}\n`;
          }
        }
        if (inputPart.isComment) {
          data += COMMENT_CHARACTER;
        }
        if (inputPart.value !== undefined) {
          data += `${inputPart.value}\n`;
        }
        break;
    }
  }

  return data;
};
