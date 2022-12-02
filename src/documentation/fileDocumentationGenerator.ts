// Local imports
import { splitTextAtLength } from "../other/splitTextAtLength";
// Type imports
import type { OrArray } from "../other/types";

export enum FileDocumentationPartType {
  /** Add a headline with a description. */
  HEADING = "HEADING",
  /** Add newline(s). */
  NEWLINE = "NEWLINE",
  /** Add text. */
  TEXT = "TEXT",
  VALUE = "VALUE",
}

export interface FileDocumentationPart<Type extends FileDocumentationPartType> {
  type: Type;
}
/** Add text. */
export interface FileDocumentationPartText
  extends FileDocumentationPart<FileDocumentationPartType.TEXT> {
  /**
   * Indicates if its normal text (default) or a comment which means no
   * whitespace after the comment character.
   */
  isComment?: boolean;
  /** Optional prefix for the text. */
  prefix?: string;
  /** The text content. If an array is provided the text will not be split. */
  text: OrArray<string>;
}
/** Add a headline with a description. */
export interface FileDocumentationPartHeading
  extends FileDocumentationPart<FileDocumentationPartType.HEADING> {
  description?: string;
  title: string;
}
/** Add a value documentation. */
export interface FileDocumentationPartValue
  extends FileDocumentationPart<FileDocumentationPartType.VALUE> {
  /** Optional value description. */
  description?: FileDocumentationPartValueDescription;
  /**
   * Indicates if its a value (default) or a comment which means a comment
   * character will be in front of the value.
   */
  isComment?: boolean;
  /** Optional value title. */
  title?: OrArray<string>;
  /** Optional value to document. */
  value?: string;
}
/** Add a number of newlines. */
export interface FileDocumentationPartNewline
  extends FileDocumentationPart<FileDocumentationPartType.NEWLINE> {
  /** The newline count. */
  count: number;
}

export interface FileDocumentationPartValueDescription {
  /** Optional additional information. */
  infos?: string[];
  /** Optional additional information lists. */
  lists?: [string, OrArray<string>[]][];
  /** The prefix for the description. */
  prefix: string;
  /** The value description. */
  text: string;
}

/** All kinds of file documentation parts. */
export type FileDocumentationParts =
  | FileDocumentationPartText
  | FileDocumentationPartHeading
  | FileDocumentationPartValue
  | FileDocumentationPartNewline;

const DEFAULT_MAX_LINE_LENGTH = 80;
const COMMENT_CHARACTER = "#";
const SPACING_CHARACTER = " ";
const HEADING_DIVIDER_CHARACTER = "-";

/**
 * Generate file documentation string.
 *
 * @param inputParts List of documentation parts.
 * @param splitLength The length after which text should be split if possible.
 * @returns The documentation multiline string that can be written to a file.
 */
export const fileDocumentationGenerator = (
  inputParts: FileDocumentationParts[],
  splitLength = DEFAULT_MAX_LINE_LENGTH
): string =>
  inputParts.reduce((out, inputPart) => {
    switch (inputPart.type) {
      case FileDocumentationPartType.NEWLINE:
        out += "\n".repeat(inputPart.count);
        break;
      case FileDocumentationPartType.TEXT:
        out += splitTextAtLength(
          inputPart.text,
          splitLength -
            COMMENT_CHARACTER.length -
            (inputPart.isComment ? 0 : SPACING_CHARACTER.length) -
            (inputPart.prefix !== undefined
              ? inputPart.prefix.length + SPACING_CHARACTER.length
              : 0)
        )
          .map(
            (a, index) =>
              `${COMMENT_CHARACTER}${
                inputPart.isComment === true ? "" : SPACING_CHARACTER
              }${
                inputPart.prefix !== undefined
                  ? index === 0
                    ? `${inputPart.prefix}${SPACING_CHARACTER}`
                    : SPACING_CHARACTER.repeat(inputPart.prefix.length + 1)
                  : ""
              }${a}\n`
          )
          .join("");
        break;
      case FileDocumentationPartType.HEADING:
        out += `${COMMENT_CHARACTER.repeat(splitLength)}\n`;
        out += [
          ...splitTextAtLength(
            inputPart.title,
            splitLength - COMMENT_CHARACTER.length - SPACING_CHARACTER.length
          ),
          ...(inputPart.description !== undefined
            ? [
                HEADING_DIVIDER_CHARACTER.repeat(
                  splitLength -
                    COMMENT_CHARACTER.length -
                    SPACING_CHARACTER.length
                ),
                ...splitTextAtLength(
                  inputPart.description,
                  splitLength -
                    COMMENT_CHARACTER.length -
                    SPACING_CHARACTER.length
                ),
              ]
            : []),
        ]
          .map((a) => `${COMMENT_CHARACTER}${SPACING_CHARACTER}${a}\n`)
          .join("");
        out += `${COMMENT_CHARACTER.repeat(splitLength)}\n`;
        break;
      case FileDocumentationPartType.VALUE:
        // Value title
        if (inputPart.title !== undefined) {
          out += fileDocumentationGenerator(
            [{ text: inputPart.title, type: FileDocumentationPartType.TEXT }],
            splitLength
          );
        }
        // Value description
        // eslint-disable-next-line no-case-declarations
        if (inputPart.description !== undefined) {
          out += fileDocumentationGenerator(
            [
              {
                prefix: inputPart.description.prefix,
                text: inputPart.description.text,
                type: FileDocumentationPartType.TEXT,
              },
            ],
            splitLength
          );
          if (inputPart.description.infos !== undefined) {
            for (const info of inputPart.description.infos) {
              out += fileDocumentationGenerator(
                [
                  {
                    prefix: SPACING_CHARACTER.repeat(
                      inputPart.description.prefix.length
                    ),
                    text: info,
                    type: FileDocumentationPartType.TEXT,
                  },
                ],
                splitLength
              );
            }
          }
          if (inputPart.description.lists !== undefined) {
            for (const [name, entries] of inputPart.description.lists) {
              out += fileDocumentationGenerator(
                [
                  {
                    prefix: SPACING_CHARACTER.repeat(
                      inputPart.description.prefix.length
                    ),
                    text: `${name}:`,
                    type: FileDocumentationPartType.TEXT,
                  },
                ],
                splitLength
              );
              for (const listEntry of entries) {
                out += fileDocumentationGenerator(
                  [
                    {
                      prefix: `${SPACING_CHARACTER.repeat(
                        inputPart.description.prefix.length + 1
                      )}-`,
                      text: listEntry,
                      type: FileDocumentationPartType.TEXT,
                    },
                  ],
                  splitLength
                );
              }
            }
          }
        }
        if (inputPart.value !== undefined) {
          out += `${inputPart.isComment ? COMMENT_CHARACTER : ""}${
            inputPart.value
          }\n`;
        }
        break;
    }
    return out;
  }, "");
