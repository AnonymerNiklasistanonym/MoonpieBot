// Package imports
import { promises as fs } from "fs";
// Local imports
import {
  FileDocumentationPartType,
  generateFileDocumentation,
} from "./other/splitTextAtLength";
// Type imports
import type {
  FileDocumentationPartValue,
  FileDocumentationParts,
} from "./other/splitTextAtLength";
import {
  ENV_VARIABLE_PREFIX,
  EnvVariable,
  EnvVariableBlock,
  envVariableInformation,
} from "./info/env";

/**
 * Environment variable handling.
 */

export const printEnvVariablesToConsole = (
  configDir: string,
  censor = true
) => {
  for (const envVariable in EnvVariable) {
    // eslint-disable-next-line security/detect-object-injection
    const envVariableName = getEnvVariableName(envVariable);
    const envVariableValue = getEnvVariableValue(envVariable);
    let legacyString = undefined;

    const envVariableInformation = getEnvVariableValueInformation(envVariable);
    let envVariableValueString = "Not found!";
    if (envVariableValue.value) {
      envVariableValueString = `"${envVariableValue.value}"`;
      if (censor && envVariableInformation.censor) {
        // Censor secret variables per default
        envVariableValueString = "*******[secret]********";
      }
      if (envVariableValue.value.length === 0) {
        envVariableValueString = "Empty string!";
      }

      // Add note if the value was derived via a legacy variable
      if (envVariableValue.legacy) {
        if (envVariableValue.envVariableName === undefined) {
          throw Error("No ENV variable name found while a value was given");
        }
        const legacyEnvVariableName = getEnvVariableName(
          envVariableValue.envVariableName
        );
        legacyString =
          "THE VALUE WAS DERIVED FROM A DEPRECATED NAME!\n" +
          `Please change the name '${legacyEnvVariableName}'\nto '${envVariableName}'`;
      }
    } else if (envVariableInformation.default) {
      const defaultStringOrFunc = envVariableInformation.default;
      envVariableValueString += ` (default="${
        typeof defaultStringOrFunc === "function"
          ? defaultStringOrFunc(configDir)
          : defaultStringOrFunc
      }")`;
    } else if (envVariableInformation.example) {
      envVariableValueString += ` (example="${envVariableInformation.example}")`;
    }

    if (envVariableInformation.necessary) {
      envVariableValueString += " (NECESSARY!)";
    }

    console.log(`${envVariableName}=${envVariableValueString}`);
    if (legacyString) {
      const legacyStrings = legacyString.split("\n");
      console.log(`\tWARNING: ${legacyStrings[0]}`);
      for (const legacyStringParts of legacyStrings.slice(1)) {
        console.log(`\t> ${legacyStringParts}`);
      }
    }
  }
};

export interface EnvVariableValue {
  /** Undefined if not found. */
  value: string | undefined;
  /** The name of the ENV variable if a value was found. */
  envVariableName: string | undefined;
  /** True if the variable was derived from a legacy variable name. */
  legacy?: boolean;
}

export const getEnvVariableValue = (
  envVariable: EnvVariable | string
): EnvVariableValue => {
  const value = process.env[getEnvVariableName(envVariable)];
  if (value === undefined) {
    // Check legacy values
    const envVariableInformation = getEnvVariableValueInformation(envVariable);
    if (
      envVariableInformation.legacyNames &&
      envVariableInformation.legacyNames.length > 0
    ) {
      for (const legacyName of envVariableInformation.legacyNames) {
        const legacyValue = process.env[getEnvVariableName(legacyName)];
        if (legacyValue) {
          return {
            value: legacyValue,
            legacy: true,
            envVariableName: legacyName,
          };
        }
      }
    }
  }
  return { value, envVariableName: envVariable.toString() };
};

export const getEnvVariableValueOrCustomDefault = <T>(
  envVariable: EnvVariable,
  defaultValue: T
): string | T => {
  const envValue = getEnvVariableValue(envVariable);
  if (envValue.value === undefined || envValue.value.trim().length === 0) {
    return defaultValue;
  }
  return envValue.value;
};
export const getEnvVariableValueOrUndefined = (
  envVariable: EnvVariable
): string | undefined => {
  const envValue = getEnvVariableValue(envVariable);
  if (envValue.value === undefined || envValue.value.trim().length === 0) {
    return undefined;
  }
  return envValue.value;
};

export const getEnvVariableValueInformation = (
  envVariable: EnvVariable | string
) => {
  const info = envVariableInformation.find((a) => a.name === envVariable);
  if (info) {
    return info;
  }
  throw Error(`The Cli variable ${envVariable} has no information`);
};

/**
 * Get the value of an environment variable or if not found a default value.
 * If the value is a (relative) path a configuration directory path needs to be supplied to get the correct value.
 *
 * @param envVariable The environment variable.
 * @param configDir The configuration directory for correct relative file paths.
 * @returns The value or default value of the environment variable.
 */
export const getEnvVariableValueOrDefault = (
  envVariable: EnvVariable,
  configDir: string
): string => {
  const value = getEnvVariableValue(envVariable);
  if (value.value === undefined || value.value.trim().length === 0) {
    const variableInformation = getEnvVariableValueInformation(envVariable);
    if (variableInformation.defaultValue) {
      if (typeof variableInformation.defaultValue === "function") {
        return variableInformation.defaultValue(configDir);
      }
      return variableInformation.defaultValue;
    }
    if (variableInformation.default) {
      if (typeof variableInformation.default === "function") {
        return variableInformation.default(configDir);
      }
      return variableInformation.default;
    }
    throw Error(`The environment variable ${envVariable} has no default`);
  }
  return value.value;
};

/**
 * Get the actual name of the environment variable.
 *
 * @param envVariable The environment variable.
 * @returns The actual name of the environment variable.
 */
export const getEnvVariableName = (
  envVariable: EnvVariable | string
): string => {
  return `${ENV_VARIABLE_PREFIX}${envVariable}`;
};

export interface EnvVariableStructureTextBlock {
  name: string;
  content: string;
}
export interface EnvVariableStructureVariablesBlock {
  block: EnvVariableBlock;
  name: string;
  description: string;
}

export const envVariableStructure: (
  | EnvVariableStructureTextBlock
  | EnvVariableStructureVariablesBlock
)[] = [
  {
    name: "File description",
    content:
      "This is an example config file for the MoonpieBot that contains all environment variables that the bot uses.",
  },
  {
    name: "File purpose",
    content:
      "You can either set the variables yourself or copy this file, rename it from `.env.example` to `.env` and edit it with your own values since this is just an example to show how it should look.",
  },
  {
    name: "How to edit file",
    content: `If a line that starts with '${ENV_VARIABLE_PREFIX}' has the symbol '#' in front of it that means it will be ignored as a comment. This means you can add custom comments and easily enable/disable any '${ENV_VARIABLE_PREFIX}' option by adding or removing that symbol.`,
  },
  {
    block: EnvVariableBlock.LOGGING,
    name: "LOGGING",
    description: "Customize how much and where should be logged.",
  },
  {
    block: EnvVariableBlock.TWITCH,
    name: "TWITCH",
    description:
      "Necessary variables that need to be set for ANY configuration to connect to Twitch chat.",
  },
  {
    block: EnvVariableBlock.MOONPIE,
    name: "MOONPIE",
    description:
      "Customize the moonpie functionality that is enabled per default.",
  },
  {
    block: EnvVariableBlock.OSU,
    name: "OSU",
    description: "Optional osu! commands that can be enabled.",
  },
  {
    block: EnvVariableBlock.OSU_API,
    name: "OSU API",
    description:
      "Optional osu! API connection that can be enabled to use more osu! commands or detect beatmap requests.",
  },
  {
    block: EnvVariableBlock.OSU_STREAM_COMPANION,
    name: "OSU STREAM COMPANION",
    description:
      "Optional osu! StreamCompanion connection that can be enabled for a much better !np command.",
  },
  {
    block: EnvVariableBlock.SPOTIFY,
    name: "SPOTIFY",
    description: "Optional Spotify commands that can be enabled.",
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    name: "SPOTIFY API",
    description:
      "Optional Spotify API connection that can be enabled to use Spotify commands.",
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    name: "Twitch API",
    description:
      "Optional Twitch API connection that can be enabled for advanced custom commands that for example set/get the current game/title.",
  },
];

export const writeEnvVariableDocumentation = async (
  path: string,
  configDir: string
) => {
  const data: FileDocumentationParts[] = [];

  for (const structurePart of envVariableStructure) {
    if (!(structurePart as EnvVariableStructureVariablesBlock)?.block) {
      // Just a text block
      const structurePartText = structurePart as EnvVariableStructureTextBlock;
      data.push({
        type: FileDocumentationPartType.TEXT,
        content: structurePartText.content,
      });
    } else {
      // Variable documentation block
      const structurePartVariables =
        structurePart as EnvVariableStructureVariablesBlock;
      data.push({
        type: FileDocumentationPartType.NEWLINE,
        count: 1,
      });
      data.push({
        type: FileDocumentationPartType.HEADING,
        title: structurePartVariables.name,
        description: structurePartVariables.description,
      });

      // Now add for each variable of the block the documentation
      for (const envVariable in EnvVariable) {
        const envVariableInfo = getEnvVariableValueInformation(envVariable);
        if (envVariableInfo?.block === structurePartVariables.block) {
          const envVariableEntry: FileDocumentationPartValue = {
            type: FileDocumentationPartType.VALUE,
            description: envVariableInfo.description,
            prefix: ">",
          };
          if (
            envVariableInfo.supportedValues &&
            envVariableInfo.supportedValues.length > 0
          ) {
            if (envVariableEntry.properties === undefined) {
              envVariableEntry.properties = [];
            }
            envVariableEntry.properties.push([
              "Supported values",
              envVariableInfo.supportedValues
                .map((a) => `'${a}'`)
                .sort()
                .join(", "),
            ]);
          }
          envVariableEntry.infos = [];
          if (envVariableInfo.censor) {
            envVariableEntry.infos.push("KEEP THIS VARIABLE PRIVATE!");
          }
          if (envVariableInfo.default) {
            const defaultStrOrFunc = envVariableInfo.default;
            envVariableEntry.value = `${ENV_VARIABLE_PREFIX}${envVariable}=${
              typeof defaultStrOrFunc === "function"
                ? defaultStrOrFunc(configDir)
                : defaultStrOrFunc
            }`;
            envVariableEntry.isComment = !envVariableInfo.necessary;
          } else if (envVariableInfo.example) {
            envVariableEntry.infos.push(
              "(The following line is only an example!)"
            );
            envVariableEntry.value = `${ENV_VARIABLE_PREFIX}${envVariable}=${envVariableInfo.example}`;
            envVariableEntry.isComment = !envVariableInfo.necessary;
          } else {
            envVariableEntry.value = `ERROR`;
          }

          if (
            envVariableInfo.legacyNames &&
            envVariableInfo.legacyNames.length > 0
          ) {
            if (envVariableEntry.properties === undefined) {
              envVariableEntry.properties = [];
            }
            envVariableEntry.properties.push([
              `Legacy name${envVariableInfo.legacyNames.length > 1 ? "s" : ""}`,
              envVariableInfo.legacyNames
                .map(getEnvVariableName)
                .map((a) => `'${a}'`)
                .join(", "),
            ]);
          }
          data.push(envVariableEntry);
        }
      }
    }
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, generateFileDocumentation(data));
};
