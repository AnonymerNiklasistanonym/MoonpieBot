// Local imports
import { splitTextAtLength } from "../other/splitTextAtLength";

/**
 * Generic information about a CLI output element.
 */
interface CliOutputElement {
  /** The type of line. */
  type: string;
}

/**
 * Generic information about a CLI output element represents text.
 */
export interface CliOutputElementText extends CliOutputElement {
  /** The text content. */
  content: string;
  type: "text";
}

/**
 * Generic information about a CLI output element list element.
 */
export interface CliOutputElementListElement {
  /** The text content. */
  content: string;
  /** An optional description. */
  description?: string;
}

/**
 * Generic information about a CLI output element represents a list.
 */
export interface CliOutputElementList extends CliOutputElement {
  /** The elements of the list. */
  elements: CliOutputElementListElement[];
  /** The title of the list. */
  title: string;
  type: "list";
}

/**
 * All supported CLI output elements.
 */
export type CliOutputElements = CliOutputElementText | CliOutputElementList;

const MINIMUM_DESCRIPTION_LENGTH_ON_THE_SIDE = 30;

/**
 * CLI output generation options.
 */
export interface CliOutputOptions {
  /** The maximum length of the output. */
  maxLineLength?: number;
}

/**
 * Default CLI output generation options.
 */
const defaultCliOutputOptions = {
  maxLineLength: 100,
};

/**
 * Generic method to generate CLI output.
 *
 * @param cliOutputLines The lines that should be generated.
 * @param outputOptions CLI output options.
 * @returns CLI output string.
 */
export const cliOutputGenerator = (
  cliOutputLines: CliOutputElements[],
  outputOptions: CliOutputOptions = {}
): string => {
  const options = {
    ...defaultCliOutputOptions,
    ...outputOptions,
  };
  const cliOutput = [];
  for (const cliOutputLine of cliOutputLines) {
    switch (cliOutputLine.type) {
      case "text":
        cliOutput.push(
          ...splitTextAtLength(cliOutputLine.content, options.maxLineLength)
        );
        break;
      case "list":
        cliOutput.push(
          ...splitTextAtLength(`${cliOutputLine.title}:`, options.maxLineLength)
        );
        // eslint-disable-next-line no-case-declarations
        const maximumListElementLength = Math.max(
          ...cliOutputLine.elements.map((a) => a.content.length + 2)
        );
        //if (maximumListElementLength >= options.maxLineLength) {
        //  throw Error(
        //    `At least one element of the list '${cliOutputLine.title}' is as long or longer than the maximum line length`
        //  );
        //}
        cliOutput.push(
          ...cliOutputLine.elements.map((a) => {
            let currentLine = `  ${a.content}`;
            const description = a.description;
            if (description === undefined) {
              // Does not need to be split because we already verified no option
              // is longer than the maximum line length
              return currentLine;
            }
            // If the maximum list element length does not leave enough room for
            // a description put the description on a new line
            if (
              options.maxLineLength - maximumListElementLength <
              MINIMUM_DESCRIPTION_LENGTH_ON_THE_SIDE
            ) {
              return [
                currentLine,
                ...description
                  .split("\n")
                  .map((b) =>
                    splitTextAtLength(
                      b,
                      options.maxLineLength - "    ".length
                    ).map((c) => `    ${c}`)
                  )
                  .flat(),
              ].join("\n");
            }
            // Otherwise put the description next to the list element content
            const descriptionTextParts = description
              .split("\n")
              .map((b) =>
                splitTextAtLength(
                  b,
                  options.maxLineLength - maximumListElementLength - "  ".length
                )
              )
              .flat();

            let first = true;
            for (const descriptionTextPart of descriptionTextParts) {
              if (first) {
                first = false;
                currentLine += `  ${" ".repeat(
                  Math.max(maximumListElementLength - currentLine.length, 0)
                )}${descriptionTextPart}`;
              } else {
                currentLine += `\n  ${" ".repeat(
                  maximumListElementLength
                )}${descriptionTextPart}`;
              }
            }
            return currentLine;
          })
        );
        break;
    }
  }
  return cliOutput.join("\n");
};
