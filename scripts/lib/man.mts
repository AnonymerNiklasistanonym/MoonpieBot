// Relative imports
import { genericFilterNonUniqueStrings } from "../../src/other/genericStringSorter.mjs";
import { monthNames } from "../../src/other/monthNames.mjs";

export interface ManPageInfoEnvVariableCommand {
  description: string;
  id: string;
  permission: string;
  regex: string;
}

export interface ManPageInfoEnvVariable {
  commands?: ManPageInfoEnvVariableCommand[];
  defaultValue?: string;
  description: string;
  exampleValue?: string;
  name: string;
  supportedListValues?: string[];
  supportedListValuesEmpty?: string;
  supportedValues?: string[];
}
export interface ManPageInfoCliOption {
  description: string;
  name: string;
  signature?: string;
}
export interface ManPageInfoCustomSection {
  content: string;
  title: string;
}

export interface ManPageInfo {
  author: string;
  binaryName: string;
  cliOptions?: ManPageInfoCliOption[];
  customSections?: ManPageInfoCustomSection[];
  description: string;
  descriptionShort: string;
  envVariables?: ManPageInfoEnvVariable[];
  name: string;
  releaseDate: Date;
  usageSignatures: string[];
  version: string;
}

export const createManPageFileContent = (info: ManPageInfo): string => {
  let outputString = "";
  // Header
  outputString += `% ${info.name}(1) ${info.binaryName} ${info.version}\n`;
  outputString += `% ${info.author}\n`;
  const monthString = monthNames[info.releaseDate.getMonth()];
  outputString += `% ${monthString} ${info.releaseDate.getFullYear()}\n`;
  outputString += "\n";
  // Name
  outputString += "# NAME\n\n";
  outputString += `${info.binaryName} - ${info.descriptionShort}.\n`;
  outputString += "\n";
  // SYNOPSIS
  outputString += "# SYNOPSIS\n\n";
  for (const usageSignature of info.usageSignatures) {
    outputString += `**${info.binaryName}** ${usageSignature.replace(
      /\[(\S+)\]/g,
      (_fullMatch: string, optionName: string) => `[*${optionName}*]`
    )}\n`;
  }
  outputString += "\n";
  // DESCRIPTION
  outputString += "# DESCRIPTION\n\n";
  outputString += `${info.description}\n`;
  outputString += "\n";
  // OPTIONS
  if (info.cliOptions !== undefined && info.cliOptions.length > 0) {
    outputString += "# OPTIONS\n\n";
    for (const cliOption of info.cliOptions) {
      outputString += `${cliOption.name}`;
      if (cliOption.signature) {
        outputString += ` ${cliOption.signature
          .split(" ")
          .map((a) => "*" + a + "*")
          .join(" ")}`;
      }
      outputString += `\n: ${cliOption.description}\n\n`;
    }
  }
  // ENVIRONMENT VARIABLES
  if (info.envVariables !== undefined && info.envVariables.length > 0) {
    outputString += "# ENVIRONMENT VARIABLES\n\n";
    for (const envVariable of info.envVariables) {
      outputString += `${envVariable.name}`;
      if (envVariable.defaultValue) {
        outputString += `="*${envVariable.defaultValue}*"`;
      }
      outputString += `\n: ${envVariable.description}\n`;
      if (envVariable.exampleValue) {
        outputString += `Example: "*${envVariable.exampleValue}*"\n`;
      }
      if (envVariable.supportedValues) {
        outputString += `Supported values: ${envVariable.supportedValues
          .map((b) => `"*${b}*"`)
          .filter(genericFilterNonUniqueStrings)
          .join(", ")}\n`;
      }
      if (envVariable.supportedListValues) {
        outputString += `Supported list values: ${envVariable.supportedListValues
          .map((b) => `"*${b}*"`)
          .filter(genericFilterNonUniqueStrings)
          .join(", ")}`;
        if (envVariable.supportedListValuesEmpty) {
          outputString += ` (empty list value: "*${envVariable.supportedListValuesEmpty}*")`;
        }
        outputString += "\n";
      }
      if (envVariable.commands && envVariable.commands.length > 0) {
        outputString += "\n";
        for (const command of envVariable.commands) {
          outputString += `- "*${command.id}*": "*${command.regex}*" (${command.permission}) - ${command.description}\n`;
        }
      }
      outputString += "\n";
    }
  }
  if (info.customSections !== undefined) {
    for (const customSection of info.customSections) {
      outputString += `# ${customSection.title}\n\n`;
      outputString += `${customSection.content.replace(/\n/g, "\n\n")}\n`;
      outputString += "\n";
    }
  }

  // Update highlighting some values
  if (info.cliOptions !== undefined) {
    for (const cliOption of info.cliOptions) {
      outputString = outputString.replace(
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(cliOption.name, "g"),
        `**${cliOption.name}**`
      );
    }
  }
  if (info.envVariables !== undefined) {
    for (const envVariable of info.envVariables) {
      outputString = outputString.replace(
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(envVariable.name, "g"),
        `**${envVariable.name}**`
      );
    }
  }
  // Fix bad paths and path formatting
  outputString = outputString
    .replace(/\.env/g, "*.env*")
    .replace(/customCommands\.json/g, "*customCommands.json*")
    .replace(/customTimers\.json/g, "*customTimers.json*")
    .replace(
      /\$HOME\/\.local\/share\/moonpiebot/g,
      "*$HOME/.local/share/moonpiebot*"
    );
  // Fix options not being displayed correctly
  outputString = outputString.replace(/--/g, "----");

  return `${outputString.trimEnd()}\n`;
};
