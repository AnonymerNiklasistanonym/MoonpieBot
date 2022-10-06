// Package imports
import { promises as fs } from "fs";
// Local imports
import {
  author,
  binaryName,
  bugTrackerUrl,
  description,
  license,
  licenseUrl,
  longDescription,
  name,
  packageDescription,
  sourceCodeUrl,
  usages,
  websiteUrl,
} from "../src/info/general";
import { ENV_PREFIX, envVariableInformation } from "../src/info/env";
import { cliOptionsInformation } from "../src/info/cli";
import { getVersionFromObject } from "../src/version";
import { version } from "../src/info/version";

export const createManPageFile = async (outputPath: string): Promise<void> => {
  let outputString = "";
  // Header
  outputString += `% ${name}(1) ${binaryName} ${getVersionFromObject(
    version
  ).slice(1)}\n`;
  outputString += `% ${author}\n`;
  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthString = monthNames[currentDate.getMonth()];
  outputString += `% ${monthString} ${currentDate.getFullYear()}\n`;
  outputString += "\n";
  // Name
  outputString += "# NAME\n\n";
  outputString += `${binaryName} - ${description}.\n`;
  outputString += "\n";
  // SYNOPSIS
  outputString += "# SYNOPSIS\n\n";
  for (const usage of usages) {
    outputString += `**${binaryName}** ${usage.signature.replace(
      /OPTIONS/g,
      "*OPTIONS*"
    )}\n`;
  }
  outputString += "\n";
  // DESCRIPTION
  outputString += "# DESCRIPTION\n\n";
  outputString += `${longDescription}\n\n${packageDescription(false)}\n`;
  outputString += "\n";
  // OPTIONS
  outputString += "# OPTIONS\n\n";
  for (const cliOption of cliOptionsInformation) {
    outputString += `${cliOption.name}`;
    if (cliOption.signature) {
      outputString += ` ${cliOption.signature
        .split(" ")
        .map((a) => "*" + a + "*")
        .join(" ")}`;
    }
    outputString += `\n: ${cliOption.description}\n\n`;
  }
  // ENVIRONMENT VARIABLES
  outputString += "# ENVIRONMENT VARIABLES\n\n";
  for (const envVariable of envVariableInformation) {
    outputString += `**${ENV_PREFIX}${envVariable.name}**`;
    if (envVariable.default) {
      outputString += `="*${
        typeof envVariable.default === "string"
          ? envVariable.default
          : envVariable.default(process.cwd())
      }*"`;
    }
    outputString += `\n: ${envVariable.description}\n`;
    if (envVariable.example) {
      outputString += `Example: "*${envVariable.example}*"\n`;
    }
    if (
      envVariable.supportedValues &&
      envVariable.supportedValues.values.length > 0
    ) {
      if (envVariable.supportedValues.canBeJoinedAsList === true) {
        outputString += `Supported list values: ${envVariable.supportedValues.values
          .map((b) => `"*${b}*"`)
          .join(", ")}`;
        if (envVariable.supportedValues.emptyListValue) {
          outputString += ` (empty list value: "*${envVariable.supportedValues.emptyListValue}*")`;
        }
      } else {
        outputString += `Supported values: ${envVariable.supportedValues.values
          .map((b) => `"*${b}*"`)
          .join(", ")}`;
      }
      outputString += "\n";
    }
    outputString += "\n";
  }
  // BUGS
  outputString += "# BUGS\n\n";
  outputString += `Bugs are tracked in GitHub Issues: ${bugTrackerUrl}\n`;
  outputString += "\n";
  // COPYRIGHT
  outputString += "# COPYRIGHT\n\n";
  outputString += `${name} is available under the ${license} license.\n\n`;
  outputString += `See ${licenseUrl} for the full license text.\n`;
  outputString += "\n";
  // SEE ALSO
  outputString += "# SEE ALSO\n\n";
  outputString += `Website and Documentation: ${websiteUrl}\n\n`;
  outputString += `GitHub repository and issue tracker: ${sourceCodeUrl}\n`;

  // Update highlighting some values and CLI options
  for (const cliOption of cliOptionsInformation) {
    outputString = outputString.replace(
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(`${cliOption.name}`, "g"),
      `**${cliOption.name}**`
    );
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

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(outputPath, outputString);
};
