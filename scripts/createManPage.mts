/* eslint-disable no-console */

// Package imports
import { fileURLToPath } from "url";
import path from "path";
// Relative imports
import {
  author,
  bugTrackerUrl,
  description,
  displayName,
  license,
  licenseUrl,
  name,
  sourceCodeUrl,
  version,
  websiteUrl,
} from "../src/info/general.mjs";
import { ENV_PREFIX, envVariableInformation } from "../src/info/env.mjs";
import {
  longDescription,
  packageDescription,
} from "../src/info/descriptions.mjs";
// import { cliOptionSignatureToString } from "../src/cli.mjs";
// import { createProgram } from "../src/info/cli.mjs";
import { convertRegexToHumanStringDetailed } from "../src/other/regexToString.mjs";
import { createJob } from "../src/createJob.mjs";
import { createManPageFileContent } from "./lib/man.mjs";
import { isStringArray } from "../src/other/types.mjs";
// Type imports
import type { ChatCommand } from "../src/chatCommand.mjs";
import type { DeepReadonlyArray } from "../src/other/types.mjs";
import type { ManPageInfoEnvVariableCommand } from "./lib/man.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(dirname, "..");
const INSTALLER_DIR = path.join(ROOT_DIR, "installer");
const filePathOutputManPage = path.join(INSTALLER_DIR, "man.md");

// -----------------------------------------------------------------------------

const getSupportedValues = (
  info: readonly string[] | DeepReadonlyArray<ChatCommand>,
): string[] => {
  if (isStringArray(info)) {
    return info.slice();
  }
  return (info as readonly ChatCommand[]).map((a) => a.id);
};
const getCommands = (
  info: readonly string[] | DeepReadonlyArray<ChatCommand>,
): ManPageInfoEnvVariableCommand[] => {
  if (isStringArray(info)) {
    return [];
  }
  return (info as readonly ChatCommand[]).map((a) => ({
    description: a.description,
    id: a.id,
    permission: a.permission,
    regex:
      typeof a.command === "string"
        ? a.command
        : convertRegexToHumanStringDetailed(a.command),
  }));
};

// TODO Create new data structure that supports options and commands

try {
  await Promise.all([
    createJob(
      "MAN page",
      filePathOutputManPage,
      createManPageFileContent({
        author,
        binaryName: name,
        cliOptions: [],
        customSections: [
          {
            content: `Bugs are tracked in GitHub Issues: ${bugTrackerUrl}`,
            title: "BUGS",
          },
          {
            content:
              `${displayName} is available under the ${license} license.\n` +
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
        description: `${longDescription}\n\n${packageDescription("linux")}`,
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
        name: displayName,
        releaseDate: new Date(),
        // TODO Convert commander usage to MAN usage
        usageSignatures: [], //usages.map((a) => a.signature),
        version,
      }),
    ),
  ]);
} catch (err) {
  console.error(err);
}
