import fs from "fs";
import path from "path";

import { getVersion } from "../src/version";
import {
  author,
  binaryName,
  shortDescription,
  name,
  sourceCodeUrl,
  longDescription,
  packageDescription,
  bugTrackerUrl,
  license,
  licenseUrl,
  websiteUrl,
} from "../src/info";
import { CliVariable, getCliVariableInformation } from "../src/cli";

const rootPath = path.join(__dirname, "..");

const manPageOutputPath = path.join(rootPath, "installer", "man.md");

const createManPageFile = (outputPath: string) => {
  console.log(`Create MAN page file '${outputPath}'...`);

  let outputString = "";
  // Header
  outputString += `% ${name}(1) ${binaryName} ${getVersion().slice(1)}\n`;
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
  outputString += `\n`;
  // Name
  outputString += `# NAME\n\n`;
  outputString += `${binaryName} - ${shortDescription}.\n`;
  outputString += `\n`;
  // SYNOPSIS
  outputString += `# SYNOPSIS\n\n`;
  outputString += `**${binaryName}** [*OPTIONS*]\n`;
  outputString += `\n`;
  // DESCRIPTION
  outputString += `# DESCRIPTION\n\n`;
  outputString += `${(longDescription + "\n\n" + packageDescription(false))
    .replace(
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(`${CliVariable.CONFIG_DIRECTORY}`, "g"),
      `**${CliVariable.CONFIG_DIRECTORY}**`
    )
    .replace(/\.env/g, "*.env*")
    .replace(/customCommands\.json/g, "*customCommands.json*")
    .replace(/customTimers\.json/g, "*customTimers.json*")
    .replace(
      /\$HOME\/\.local\/share\/moonpiebot/g,
      "*$HOME/.local/share/moonpiebot*"
    )}\n`;
  outputString += `\n`;
  // OPTIONS
  outputString += `# OPTIONS\n\n`;
  for (const cliVariable of Object.values(CliVariable)) {
    outputString += `**${cliVariable}**`;
    const cliVariableInfo = getCliVariableInformation(cliVariable);
    if (cliVariableInfo.signature) {
      outputString += ` ${cliVariableInfo.signature
        .split(" ")
        .map((a) => "*" + a + "*")
        .join(" ")}`;
    }
    outputString += `\n: ${cliVariableInfo.description}\n\n`;
  }
  // BUGS
  outputString += `# BUGS\n\n`;
  outputString += `Bugs are tracked in GitHub Issues: ${bugTrackerUrl}\n`;
  outputString += `\n`;
  // COPYRIGHT
  outputString += `# COPYRIGHT\n\n`;
  outputString += `${name} is available under the ${license} license.\n\n`;
  outputString += `See ${licenseUrl} for the full license text.\n`;
  outputString += `\n`;
  // SEE ALSO
  outputString += `# SEE ALSO\n\n`;
  outputString += `Website and Documentation: ${websiteUrl}\n\n`;
  outputString += `GitHub repository and issue tracker: ${sourceCodeUrl}\n`;

  // Fix options not being displayed correctly
  outputString = outputString.replace(/--/g, "----");

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFile(outputPath, outputString, (err) => {
    if (err) throw err;
  });
};

createManPageFile(manPageOutputPath);
