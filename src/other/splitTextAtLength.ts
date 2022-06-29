/**
 * Split text input into an array of text that never exceeds the split length
 * while also not breaking words off.
 *
 * @param textInput The text that should be split.
 * @param splitLength The maximum length of each text string in the output array.
 * @returns Array of text strings that never exceed the split length.
 */
export const splitTextAtLength = (textInput: string, splitLength: number) => {
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
  TEXT = "TEXT",
  HEADING = "HEADING",
  VALUE = "VALUE",
  NEWLINE = "NEWLINE",
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
  title: string;
  description?: string;
}
export interface FileDocumentationPartValue
  extends FileDocumentationPart<FileDocumentationPartType.VALUE> {
  isComment?: boolean;
  description?: string;
  value?: string;
  title?: string;
  prefix: string;
  lists?: [string, string[]][];
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

export const generateFileDocumentation = (
  input: FileDocumentationParts[],
  maxLineLength = 80
) => {
  let data = "";

  for (const inputPart of input) {
    switch (inputPart.type) {
      case FileDocumentationPartType.NEWLINE:
        data += "\n".repeat(inputPart.count);
        break;
      case FileDocumentationPartType.TEXT:
        data += splitTextAtLength(
          inputPart.content,
          maxLineLength - (inputPart.isComment ? 1 : 2)
        )
          .map((a) => `#${inputPart.isComment ? "" : " "}${a}\n`)
          .join("");
        break;
      case FileDocumentationPartType.HEADING:
        data += "#".repeat(maxLineLength) + "\n";
        data += splitTextAtLength(inputPart.title, maxLineLength - 2)
          .map((a) => `# ${a}\n`)
          .join("");
        if (inputPart.description !== undefined) {
          data += "# " + "-".repeat(maxLineLength - 2) + "\n";
          data += splitTextAtLength(inputPart.description, maxLineLength - 2)
            .map((a) => `# ${a}\n`)
            .join("");
        }
        data += "#".repeat(maxLineLength) + "\n";
        break;
      case FileDocumentationPartType.VALUE:
        if (inputPart.title !== undefined) {
          data += `# ${inputPart.title}\n`;
        }
        if (inputPart.description !== undefined) {
          data += splitTextAtLength(
            inputPart.description,
            maxLineLength - 2 - inputPart.prefix.length - 1
          )
            .map(
              (a, index) =>
                `# ${
                  index === 0
                    ? inputPart.prefix
                    : " ".repeat(inputPart.prefix.length)
                } ${a}\n`
            )
            .join("");
        }
        if (inputPart.lists !== undefined && inputPart.lists.length > 0) {
          for (const list of inputPart.lists) {
            data += `# ${" ".repeat(inputPart.prefix.length)} ${list[0]}:\n`;
            data += list[1]
              .map((a) => `# ${" ".repeat(inputPart.prefix.length)} - ${a}\n`)
              .join("");
          }
        }
        if (inputPart.isComment) {
          data += "#";
        }
        if (inputPart.value !== undefined) {
          data += `${inputPart.value}\n`;
        }
        break;
    }
  }

  return data;
};
