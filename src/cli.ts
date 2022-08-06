/**
 * Command line interface handling.
 */

// Local imports
import { splitTextAtLength } from "./other/splitTextAtLength";

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
export const defaultCliOutputOptions = {
  maxLineLength: 100,
};

/**
 * Generic information about the usage of the program.
 */
export interface CliUsageInformation {
  /** The signature of the usage option. */
  signature: string;
}

/**
 * Generic information about a CLI option.
 */
export interface CliOptionInformation<NAME = string> {
  /** The name of the option. */
  name: NAME;
  /** The signature of the option. */
  signature?: string;
  /** The description of the option. */
  description: string;
  /** The default value. */
  default?: string | ((configDir: string) => string);
  /** Usage example. */
  example?: string;
}

/**
 * Generic information about a CLI environment variable.
 */
export interface CliEnvVariableInformation<NAME = string> {
  /** The name of the environment variable. */
  name: NAME;
  /** The description of the environment variable. */
  description: string;
  /** The default value. */
  default?: string | ((configDir: string) => string);
  /** Usage example. */
  example?: string;
  /** The supported values. */
  supportedValues?: string[];
}

/**
 * Generic information about a CLI output element.
 */
export interface CliOutputElement {
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
  /** The title of the list. */
  title: string;
  /** The elements of the list. */
  elements: CliOutputElementListElement[];
  type: "list";
}

/**
 * All supported CLI output elements.
 */
export type CliOutputElements = CliOutputElementText | CliOutputElementList;

/**
 * Generic method to generate CLI help output.
 *
 * @param programName The name of the program.
 * @param cliUsagesInformation A list of all CLI usages.
 * @param cliOptionsInformation A list of all CLI options.
 * @param cliEnvVariableInformation A list of all ENV variables.
 * @param configDir The configuration directory.
 * @param outputOptions CLI output options.
 * @returns CLI help output string.
 */
export const cliHelpGenerator = (
  programName: string,
  cliUsagesInformation: CliUsageInformation[],
  cliOptionsInformation: CliOptionInformation[] = [],
  cliEnvVariableInformation: CliEnvVariableInformation[] = [],
  configDir: string,
  outputOptions: CliOutputOptions = {}
): string => {
  const helpOutput: CliOutputElements[] = [];

  // Add usage information
  if (cliUsagesInformation.length === 0) {
    helpOutput.push({
      type: "list",
      title: "Usage",
      elements: [{ content: programName }],
    });
  } else {
    helpOutput.push({
      type: "list",
      title: "Usage",
      elements: cliUsagesInformation.map((a) => ({
        content: `${programName}${a.signature.length > 0 ? " " : ""}${
          a.signature
        }`,
      })),
    });
  }

  // Add options
  if (cliOptionsInformation.length > 0) {
    helpOutput.push({ type: "text", content: "" });
    helpOutput.push({
      type: "list",
      title: "Options",
      elements: cliOptionsInformation.map((a) => {
        let description = a.description;
        let content = a.name;
        if (a.signature) {
          content += ` ${a.signature}`;
        }
        if (a.default) {
          description += `\nDefault: '${
            typeof a.default === "function" ? a.default(configDir) : a.default
          }'`;
        }
        if (a.example) {
          description += `\nExample: '${a.example}'`;
        }
        return {
          content,
          description,
        };
      }),
    });
  }

  // Add environment variables
  if (cliEnvVariableInformation.length > 0) {
    helpOutput.push({ type: "text", content: "" });
    helpOutput.push({
      type: "list",
      title: "Environment variables",
      elements: cliEnvVariableInformation.map((a) => {
        let content = a.name;
        if (a.default) {
          content += `=${
            typeof a.default === "function" ? a.default(configDir) : a.default
          }`;
        }
        let description = a.description;
        if (a.example) {
          description += `\nExample: '${a.example}'`;
        }
        if (a.supportedValues && a.supportedValues.length > 0) {
          description += `\nSupported Values: ${a.supportedValues
            .map((b) => `'${b}'`)
            .join(", ")}`;
        }
        return {
          content,
          description,
        };
      }),
    });
  }

  return cliOutputGenerator(helpOutput, outputOptions);
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
) => {
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
        if (maximumListElementLength >= options.maxLineLength) {
          throw Error(
            `At least one element of the list '${cliOutputLine.title}' is as long or longer than the maximum line length`
          );
        }
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
            if (options.maxLineLength - maximumListElementLength < 30) {
              return [
                currentLine,
                ...description
                  .split("\n")
                  .map((b) =>
                    splitTextAtLength(b, options.maxLineLength - 4).map(
                      (c) => `    ${c}`
                    )
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
                  options.maxLineLength - maximumListElementLength - 2
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
