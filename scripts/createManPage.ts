/* eslint-disable no-console */

// Package imports
import path from "path";
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
import { cliOptionSignatureToString } from "../src/cli";
import { cliOptionsInformation } from "../src/info/cli";
import { convertRegexToHumanStringDetailed } from "../src/other/regexToString";
import { createJob } from "../src/createJob";
import { createManPageFileContent } from "./lib/man";
import { getVersionString } from "../src/version";
import { version } from "../src/info/version";
// Type imports
import type { ChatCommand } from "../src/chatCommand";
import type { ManPageInfoEnvVariableCommand } from "./lib/man";

const ROOT_DIR = path.join(__dirname, "..");
const INSTALLER_DIR = path.join(ROOT_DIR, "installer");
const filePathOutputManPage = path.join(INSTALLER_DIR, "man.md");

// -----------------------------------------------------------------------------

const getSupportedValues = (
  info: string[] | readonly ChatCommand<string>[]
): string[] => {
  if (info.length === 0 || typeof info[0] === "string") {
    return info as string[];
  }
  return (info as readonly ChatCommand<string>[]).map((a) => a.id);
};
const getCommands = (
  info: string[] | readonly ChatCommand<string>[]
): ManPageInfoEnvVariableCommand[] => {
  if (info.length === 0 || typeof info[0] === "string") {
    return [];
  }
  return (info as readonly ChatCommand<string>[]).map((a) => ({
    description: a.description,
    id: a.id,
    permission: a.permission,
    regex:
      typeof a.command === "string"
        ? a.command
        : convertRegexToHumanStringDetailed(a.command),
  }));
};

Promise.all([
  createJob(
    "MAN page",
    filePathOutputManPage,
    createManPageFileContent({
      author,
      binaryName,
      cliOptions: cliOptionsInformation.map((a) => ({
        description: a.description,
        name: a.name,
        signature:
          a.signature !== undefined
            ? cliOptionSignatureToString(a.signature)
            : undefined,
      })),
      customSections: [
        {
          content: `Bugs are tracked in GitHub Issues: ${bugTrackerUrl}`,
          title: "BUGS",
        },
        {
          content:
            `${name} is available under the ${license} license.\n` +
            `See ${licenseUrl} for the full license text.`,
          title: "COPYRIGHT",
        },
        {
          content:
            `Website and Documentation: ${websiteUrl}\n` +
            `GitHub repository and issue tracker: ${sourceCodeUrl}`,
          title: "SEE ALSO",
        },
      ],
      description: `${longDescription}\n\n${packageDescription(false)}`,
      descriptionShort: description,
      envVariables: envVariableInformation.map((a) => ({
        commands:
          a.supportedValues !== undefined
            ? getCommands(a.supportedValues.values)
            : undefined,
        defaultValue:
          a.default !== undefined
            ? typeof a.default === "string"
              ? a.default
              : a.default(ROOT_DIR)
            : undefined,
        description: a.description,
        exampleValue: a.example,
        name: `${ENV_PREFIX}${a.name}`,
        supportedListValues:
          a.supportedValues !== undefined &&
          a.supportedValues.canBeJoinedAsList === true
            ? getSupportedValues(a.supportedValues.values)
            : undefined,
        supportedListValuesEmpty: a.supportedValues?.emptyListValue,
        supportedValues:
          a.supportedValues !== undefined &&
          a.supportedValues.canBeJoinedAsList !== true
            ? getSupportedValues(a.supportedValues.values)
            : undefined,
      })),
      name,
      releaseDate: new Date(),
      usageSignatures: usages.map((a) => a.signature),
      version: getVersionString(version, ""),
    })
  ),
]).catch(console.error);
