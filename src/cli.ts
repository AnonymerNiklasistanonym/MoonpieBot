// Local imports
import { splitTextAtLength } from "./other/splitTextAtLength";

/** Path to the root directory of the source code. */
const pathToCwdDir = process.cwd();

/**
 * Command line interface variable handling.
 */

/**
 * Command line interface variables.
 */
export enum CliVariable {
  CONFIG_DIRECTORY = "--config-dir",
  DISABLE_CENSORING = "--disable-censoring",
  HELP = "--help",
  VERSION = "--version",
}

export interface CliVariableInformation {
  default?: string;
  example?: string;
  description: string;
  signature?: string;
}

export const getCliVariableInformation = (
  cliVariable: CliVariable | string
): CliVariableInformation => {
  switch (cliVariable) {
    case CliVariable.CONFIG_DIRECTORY:
      return {
        default: pathToCwdDir,
        description:
          "The directory that should contain all configurations and databases if not configured otherwise",
        signature: "CONFIG_DIR",
      };
    case CliVariable.DISABLE_CENSORING:
      return {
        description:
          "Disabling the censoring stops the censoring of private tokens which is helpful to debug if the inputs are read correctly but should otherwise be avoided",
      };
    case CliVariable.HELP:
      return {
        description:
          "Get instructions on how to run and configure this program",
      };
    case CliVariable.VERSION:
      return {
        description: "Get the version of the program",
      };
  }
  throw Error(`The CLI variable ${cliVariable} has no information`);
};

export const getCliVariableDocumentation = () => {
  let data = "";
  let currentLine = "";
  const maxLineLength = 80;
  const optionsLength = 30;

  let firstVar = true;
  for (const cliVariable of Object.values(CliVariable)) {
    if (firstVar) {
      firstVar = false;
    } else {
      data += "\n";
    }
    currentLine += `  ${cliVariable}`;
    const cliVariableInformation = getCliVariableInformation(cliVariable);
    if (cliVariableInformation.signature) {
      currentLine += ` ${cliVariableInformation.signature}`;
    }
    const textData = splitTextAtLength(
      cliVariableInformation.description,
      maxLineLength - optionsLength
    );
    let first = true;
    for (const textDataPart of textData) {
      if (first) {
        first = false;
        currentLine += `${" ".repeat(
          Math.max(optionsLength - currentLine.length, 0)
        )}${textDataPart}`;
      } else {
        currentLine += `\n${" ".repeat(optionsLength)}${textDataPart}`;
      }
      data += currentLine;
      currentLine = "";
    }
    if (cliVariableInformation.default) {
      data += `\n${" ".repeat(optionsLength)}Default: ${
        cliVariableInformation.default
      }`;
    }
    if (cliVariableInformation.example) {
      data += `\n${" ".repeat(optionsLength)}Example: ${
        cliVariableInformation.example
      }`;
    }
  }

  return data;
};
