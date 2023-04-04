/* eslint-disable no-console */

// Package imports
import { fileURLToPath } from "node:url";
import path from "path";
// Relative imports
import { createConsoleLogger, LoggerLevel } from "../src/logging.mjs";
import {
  ENV_LIST_SPLIT_CHARACTER,
  ENV_PREFIX,
  EnvVariable,
  envVariableInformation,
  EnvVariableOtherListOptions,
  envVariableStructure,
} from "../src/info/env.mjs";
import { getOptionFlag, optionCustomConfigDir } from "../src/info/cli.mjs";
import { convertRegexToHumanStringDetailed } from "../src/other/regexToString.mjs";
import { createEnvVariableDocumentation } from "../src/documentation/envVariableDocumentation.mjs";
import { createJobUpdate } from "../src/createJob.mjs";
import { defaultConfigDir } from "../src/info/files.mjs";
import { fileNameEnv } from "../src/info/files.mjs";
import { getFeatures } from "../src/info/features.mjs";
import { getMdComment } from "./lib/markdown.mjs";
import { getMoonpieConfigFromEnv } from "../src/info/config/moonpieConfig.mjs";
import { name } from "../src/info/general.mjs";
import { OsuCommands } from "../src/info/chatCommands.mjs";
// Type imports
import type { DeepReadonly } from "../src/other/types.mjs";
import type { Features } from "../src/info/features.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Describes how a Markdown comment text that should be recognized looks like. */
const mdCommentText = Object.freeze({
  begin: "BEGIN:",
  end: "END",
});

/** A list of all supported comment instructions. */
enum CommentInstructionType {
  DEFAULT_CONFIG_DIR_LOCATION = "DEFAULT_CONFIG_DIR_LOCATION=",
  DEFAULT_CONFIG_DIR_SECTION = "DEFAULT_CONFIG_DIR_SECTION",
  ENV_EXAMPLE = "ENV_EXAMPLE=",
  LIST_ENV = "LIST_ENV=",
  LIST_ENV_BLOCK = "LIST_ENV_BLOCK=",
  TABLE_ENABLE_COMMANDS = "TABLE_ENABLE_COMMANDS=",
}

/** A parsed comment instruction. */
interface CommentInstruction {
  /** The argument of the instruction. */
  argument: string;
  /** The type/id of the instruction. */
  instruction: CommentInstructionType;
}

/**
 * Parse a detected comment instruction.
 *
 * @param comment The comment text.
 * @returns Parsed comment instruction.
 */
const parseCommentInstruction = (comment: string): CommentInstruction => {
  if (comment.startsWith(CommentInstructionType.LIST_ENV_BLOCK)) {
    return {
      argument: comment.substring(CommentInstructionType.LIST_ENV_BLOCK.length),
      instruction: CommentInstructionType.LIST_ENV_BLOCK,
    };
  }
  if (comment.startsWith(CommentInstructionType.LIST_ENV)) {
    return {
      argument: comment.substring(CommentInstructionType.LIST_ENV.length),
      instruction: CommentInstructionType.LIST_ENV,
    };
  }
  if (comment.startsWith(CommentInstructionType.TABLE_ENABLE_COMMANDS)) {
    return {
      argument: comment.substring(
        CommentInstructionType.TABLE_ENABLE_COMMANDS.length,
      ),
      instruction: CommentInstructionType.TABLE_ENABLE_COMMANDS,
    };
  }
  if (comment === CommentInstructionType.DEFAULT_CONFIG_DIR_SECTION) {
    return {
      argument: "",
      instruction: CommentInstructionType.DEFAULT_CONFIG_DIR_SECTION,
    };
  }
  if (comment.startsWith(CommentInstructionType.DEFAULT_CONFIG_DIR_LOCATION)) {
    return {
      argument: comment.substring(
        CommentInstructionType.DEFAULT_CONFIG_DIR_LOCATION.length,
      ),
      instruction: CommentInstructionType.DEFAULT_CONFIG_DIR_LOCATION,
    };
  }
  if (comment.startsWith(CommentInstructionType.ENV_EXAMPLE)) {
    return {
      argument: comment.substring(CommentInstructionType.ENV_EXAMPLE.length),
      instruction: CommentInstructionType.ENV_EXAMPLE,
    };
  }
  throw Error(`Unknown comment instruction: ${comment}`);
};

/**
 * Create the from the comment instruction specified content.
 *
 * @param commentInstruction The comment instruction.
 * @returns Text content.
 */
const createCommentContent = async (
  commentInstruction: DeepReadonly<CommentInstruction>,
): Promise<string> => {
  let output = "";
  switch (commentInstruction.instruction) {
    case CommentInstructionType.DEFAULT_CONFIG_DIR_LOCATION:
      output += `The default location of the configuration/database/etc. files is \`${defaultConfigDir(
        commentInstruction.argument === "WINDOWS" ? "win32" : "linux",
      )}\`.\n`;
      break;
    case CommentInstructionType.DEFAULT_CONFIG_DIR_SECTION:
      output += "- set environment variables\n";
      output += `- list the environment variables in a \`${fileNameEnv}\` file in the same directory you run \`${name}\`\n`;
      output += "  If you use a desktop/start menu shortcut created by\n";
      output += `  - the Windows installer the directory becomes \`${defaultConfigDir(
        "win32",
      )}\`\n`;
      output += `  - a Linux package the directory becomes \`${defaultConfigDir(
        "linux",
      )}\`\n`;
      output += `\nNote: Via the command line argument \`${getOptionFlag(
        optionCustomConfigDir,
      )}\` or the Windows installer shortcut for a custom configuration directory you can always change the directory which is searched for the \`${fileNameEnv}\` and other configuration files.\n`;
      break;
    case CommentInstructionType.ENV_EXAMPLE:
      // eslint-disable-next-line no-case-declarations
      const envExampleArgs = commentInstruction.argument.split(",");
      output += await createEnvExample(
        envExampleArgs[0],
        envExampleArgs.length > 1 ? parseInt(envExampleArgs[1]) : undefined,
      );
      break;
    case CommentInstructionType.LIST_ENV:
      // eslint-disable-next-line no-case-declarations
      const listEnvArguments = commentInstruction.argument.split(",");
      for (const listEnvArgument of listEnvArguments) {
        output += createListEnvEntry(listEnvArgument);
      }
      break;
    case CommentInstructionType.LIST_ENV_BLOCK:
      output += createListEnvBlockEntries(commentInstruction.argument);
      break;
    case CommentInstructionType.TABLE_ENABLE_COMMANDS:
      output += createTableEnableCommands(commentInstruction.argument);
      break;
  }
  return output;
};

const updateReadmeFile = async (
  mdFile: DeepReadonly<Buffer>,
): Promise<string> => {
  let output = "";
  let lookForEnd = false;
  let mdComment: string | undefined;
  let lastMdComment: string | undefined;
  for (const line of mdFile.toString().split("\n")) {
    // If not looking for end add the line
    if (!lookForEnd) {
      output += `${line}\n`;
    }
    // Check if the line is a comment
    mdComment = getMdComment(line);
    if (mdComment === undefined) {
      continue;
    }
    // If not looking for end and the comment starts with a begin parse it
    if (!lookForEnd && mdComment.startsWith(mdCommentText.begin)) {
      lastMdComment = mdComment;
      // Add content
      const commentInstruction = parseCommentInstruction(
        mdComment.substring(mdCommentText.begin.length),
      );
      output += `\n${await createCommentContent(commentInstruction)}\n`;
      // Look for the end now
      lookForEnd = true;
      continue;
    }
    // If looking for end and the comment starts with a end add it and end search
    if (lookForEnd && mdComment === mdCommentText.end) {
      output += `${line}\n`;
      lookForEnd = false;
    }
  }

  // Sanity check in case there is no end before updating the document
  if (lookForEnd && lastMdComment !== undefined) {
    throw Error(`Found no end of '${lastMdComment}'`);
  }

  return `${output.trimEnd()}\n`;
};

// -----------------------------------------------------------------------------

const createEnvVarValueString = (
  envVariable: DeepReadonly<EnvExampleInfo>,
): string => {
  const configDir = path.join(dirname, "..");
  const info = envVariableInformation.find((a) => a.name === envVariable.id);
  if (info === undefined) {
    throw Error(`No info was found for ${envVariable.id}`);
  }
  if (envVariable.useCustomValue !== undefined) {
    return envVariable.useCustomValue;
  }
  if (info.default && envVariable.useExample !== true) {
    return typeof info.default === "string"
      ? info.default
      : info.default(configDir);
  }
  if (info.example || envVariable.useExample !== true) {
    if (info.example === undefined) {
      throw Error(`No example was found for ${envVariable.id}`);
    }
    return info.example;
  }
  throw Error(
    `No default, example or custom value found for ${envVariable.id}`,
  );
};

interface EnvExampleInfo {
  id: EnvVariable;
  useCustomValue?: string;
  useExample?: boolean;
}

const createEnvExample = async (
  envExampleId: string,
  indentation = 0,
): Promise<string> => {
  const envExampleVariables: EnvExampleInfo[] = [];
  switch (envExampleId) {
    case "BASIC":
      envExampleVariables.push(
        { id: EnvVariable.TWITCH_NAME },
        { id: EnvVariable.TWITCH_CHANNELS },
        { id: EnvVariable.TWITCH_OAUTH_TOKEN },
      );
      break;
    case "LUNE":
      envExampleVariables.push(
        { id: EnvVariable.TWITCH_NAME },
        { id: EnvVariable.TWITCH_CHANNELS },
        { id: EnvVariable.TWITCH_OAUTH_TOKEN },
      );
      envExampleVariables.push({
        id: EnvVariable.MOONPIE_ENABLE_COMMANDS,
        useExample: true,
      });
      envExampleVariables.push(
        { id: EnvVariable.OSU_API_CLIENT_ID },
        { id: EnvVariable.OSU_API_CLIENT_SECRET },
        { id: EnvVariable.OSU_API_DEFAULT_ID },
      );
      envExampleVariables.push(
        { id: EnvVariable.OSU_IRC_PASSWORD },
        { id: EnvVariable.OSU_IRC_REQUEST_TARGET },
        { id: EnvVariable.OSU_IRC_USERNAME },
      );
      envExampleVariables.push({
        id: EnvVariable.OSU_STREAM_COMPANION_DIR_PATH,
      });
      break;
    case "GEO":
      envExampleVariables.push(
        { id: EnvVariable.TWITCH_NAME },
        { id: EnvVariable.TWITCH_CHANNELS },
        { id: EnvVariable.TWITCH_OAUTH_TOKEN },
      );
      envExampleVariables.push({
        id: EnvVariable.OSU_ENABLE_COMMANDS,
        useCustomValue: Object.values(OsuCommands)
          .filter((a) => a !== OsuCommands.NP)
          .join(ENV_LIST_SPLIT_CHARACTER),
      });
      envExampleVariables.push(
        { id: EnvVariable.OSU_API_CLIENT_ID },
        { id: EnvVariable.OSU_API_CLIENT_SECRET },
        { id: EnvVariable.OSU_API_DEFAULT_ID },
      );
      envExampleVariables.push(
        { id: EnvVariable.OSU_IRC_PASSWORD },
        { id: EnvVariable.OSU_IRC_REQUEST_TARGET },
        { id: EnvVariable.OSU_IRC_USERNAME },
      );
      envExampleVariables.push({
        id: EnvVariable.CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS,
        useCustomValue: EnvVariableOtherListOptions.NONE,
      });
      break;
    default:
      throw Error(`Unable to find env example '${envExampleId}'`);
  }
  for (const envVar of Object.values(EnvVariable)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete process.env[`${ENV_PREFIX}${envVar}`];
  }
  for (const envVar of envExampleVariables) {
    process.env[`${ENV_PREFIX}${envVar.id}`] = createEnvVarValueString(envVar);
  }
  const moonpieConfig = await getMoonpieConfigFromEnv(path.join(dirname));
  const indent = " ".repeat(indentation);
  const renderFeatureEnabledCommands = (
    features: DeepReadonly<Features>,
  ): string => {
    if (features.chatCommands.length === 0) {
      return "";
    }
    let output = "\n";
    for (const chatCommand of features.chatCommands) {
      output += `${indent}  - \`${
        typeof chatCommand.command === "string"
          ? chatCommand.command
          : convertRegexToHumanStringDetailed(chatCommand.command)
      }\` (${chatCommand.permission}): ${chatCommand.description}\n`;
    }
    return output;
  };
  return `\`\`\`sh\n${createEnvVariableDocumentation(
    path.join(dirname),
    undefined,
    moonpieConfig,
    { createExampleConfigDocumentation: true },
  )
    .split("\n")
    .map((a) => indent + a)
    .join("\n")
    .trim()}\n${indent}\`\`\`\n\nSupported features:\n\n${(
    await getFeatures(moonpieConfig, createConsoleLogger("", LoggerLevel.OFF))
  )
    .map(
      (b) =>
        `${indent}- ${b.id}: ${b.description}${renderFeatureEnabledCommands(
          b,
        ).trimEnd()}`,
    )
    .join("\n")}\n`;
};

const createListEnvEntry = (envVarName: string): string => {
  const info = envVariableInformation.find((a) => a.name === envVarName);
  if (info === undefined) {
    throw Error(`Unable to find env entry '${envVarName}'`);
  }
  const supportedValues = info.supportedValues?.values.map((a) =>
    typeof a === "string" ? a : a.id,
  );
  return `- [${info.required === true ? "x" : " "}] ${
    info.description
  }\n\n    ${
    info.default !== undefined
      ? "Default:"
      : info.example !== undefined
      ? "Example:"
      : "TODO:"
  } \`${ENV_PREFIX}${info.name}=${
    info.default !== undefined
      ? typeof info.default === "string"
        ? info.default
        : info.default(path.join(dirname, ".."))
      : info.example ?? "TODO"
  }\`${
    supportedValues !== undefined
      ? `\n\n    Supported values: ${supportedValues
          .map((a) => `\`${a}\``)
          .join(", ")}`
      : ""
  }\n`;
};

const createListEnvBlockEntries = (envBlockName: string): string => {
  const infosBlock = envVariableStructure.find(
    (a) => "block" in a && a.block === envBlockName,
  );
  let blockInformation = "";
  if (infosBlock !== undefined) {
    blockInformation = infosBlock.content + "\n\n";
  }
  const infos = envVariableInformation.filter((a) => a.block === envBlockName);
  if (infos.length === 0) {
    throw Error(`Unable to find any env entry of the block '${envBlockName}'`);
  }
  return (
    blockInformation + infos.map((a) => createListEnvEntry(a.name)).join("")
  );
};

const createTableEnableCommands = (envVarName: string): string => {
  const info = envVariableInformation.find(
    (a) => a.name === `${envVarName}_ENABLE_COMMANDS`,
  );
  if (info === undefined) {
    throw Error(`Unable to find env entry '${envVarName}_ENABLE_COMMANDS'`);
  }
  if (info.supportedValues === undefined) {
    throw Error(
      `Unable to find supported values for '${envVarName}_ENABLE_COMMANDS'`,
    );
  }
  let output = "";
  const tableColumns = ["Chat", "Command", "Permissions", "Description"];
  output += tableColumns.join(" | ") + "\n";
  output += tableColumns.map(() => "---").join(" | ") + "\n";
  for (const supportedValue of info.supportedValues.values) {
    if (typeof supportedValue === "string") {
      output += ["TODO", supportedValue, "TODO", "TODO"].join(" | ") + "\n";
      continue;
    }
    output +=
      [
        `\`${(typeof supportedValue.command === "string"
          ? supportedValue.command
          : convertRegexToHumanStringDetailed(supportedValue.command)
        ).replace(/\|/g, "\\|")}\``,
        `\`${supportedValue.id}\``,
        supportedValue.permission,
        supportedValue.description,
      ].join(" | ") + "\n";
  }
  return output;
};

// -----------------------------------------------------------------------------

const filePathReadme = path.join(dirname, "..", "README.md");

// -----------------------------------------------------------------------------

try {
  await Promise.all([
    createJobUpdate(
      "README",
      ["comment content"],
      filePathReadme,
      updateReadmeFile,
    ),
  ]);
} catch (err) {
  console.error(err);
}
