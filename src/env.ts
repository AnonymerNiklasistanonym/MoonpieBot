// Package imports
import { promises as fs } from "fs";
// Local imports
import {
  FileDocumentationPartType,
  generateFileDocumentation,
} from "./other/splitTextAtLength";
// Type imports
import {
  ENV_LIST_SPLIT_CHARACTER,
  ENV_VARIABLE_PREFIX,
  EnvVariable,
  EnvVariableBlock,
  envVariableInformation,
} from "./info/env";
import type {
  FileDocumentationParts,
  FileDocumentationPartValue,
} from "./other/splitTextAtLength";

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
    let legacyString;

    const envVariableInfo = getEnvVariableValueInformation(envVariable);
    let envVariableValueString = "Not found!";
    if (envVariableValue.value) {
      envVariableValueString = `"${envVariableValue.value}"`;
      if (censor && envVariableInfo.censor) {
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
    } else if (envVariableInfo.default) {
      const defaultStringOrFunc = envVariableInfo.default;
      envVariableValueString += ` (default="${
        typeof defaultStringOrFunc === "function"
          ? defaultStringOrFunc(configDir)
          : defaultStringOrFunc
      }")`;
    } else if (envVariableInfo.example) {
      envVariableValueString += ` (example="${envVariableInfo.example}")`;
    }

    if (envVariableInfo.required) {
      envVariableValueString += " (REQUIRED!)";
    }

    // eslint-disable-next-line no-console
    console.log(`${envVariableName}=${envVariableValueString}`);
    if (legacyString) {
      const legacyStrings = legacyString.split("\n");
      // eslint-disable-next-line no-console
      console.log(`\tWARNING: ${legacyStrings[0]}`);
      for (const legacyStringParts of legacyStrings.slice(1)) {
        // eslint-disable-next-line no-console
        console.log(`\t> ${legacyStringParts}`);
      }
    }
  }
};

export interface EnvVariableValue {
  /** The name of the ENV variable if a value was found. */
  envVariableName: string | undefined;
  /** True if the variable was derived from a legacy variable name. */
  legacy?: boolean;
  /** Undefined if not found. */
  value: string | undefined;
}

/**
 * Get the value of an environment variable or throw an error if it's value is
 * provided multiple times (via legacy variables) or does not match the
 * supported values.
 *
 * @param envVariable The ENV variable (name).
 * @returns The value and which environment variable it's derived from or
 * undefined values if not found.
 */
export const getEnvVariableValue = (
  envVariable: EnvVariable | string
): EnvVariableValue => {
  let value = process.env[getEnvVariableName(envVariable)];
  let legacy = false;
  let envVariableName = envVariable;

  let legacyValue: string | undefined;
  let legacyEnvVariableName: string | undefined;

  const envVariableInfo = getEnvVariableValueInformation(envVariable);

  // Check for legacy values (and throw errors if multiple values are found)
  if (envVariableInfo.legacyNames && envVariableInfo.legacyNames.length > 0) {
    for (const legacyName of envVariableInfo.legacyNames) {
      const foundLegacyValue = process.env[getEnvVariableName(legacyName)];
      if (foundLegacyValue === undefined) {
        continue;
      }
      if (value !== undefined) {
        throw Error(
          `Found a value for "${envVariable}" and it's legacy variable "${envVariable}" but only one is allowed`
        );
      }
      if (legacyValue !== undefined && legacyEnvVariableName !== undefined) {
        throw Error(
          `Found multiple legacy values for "${envVariable}" ("${legacyEnvVariableName}", "${legacyName}") but only one is allowed`
        );
      }
      legacyValue = foundLegacyValue;
      legacyEnvVariableName = legacyName;
    }
  }
  // Determine the final values
  if (
    value === undefined &&
    legacyValue !== undefined &&
    legacyEnvVariableName !== undefined
  ) {
    value = legacyValue;
    envVariableName = legacyEnvVariableName;
    legacy = true;
  }

  // If there are supported values check if the value matches them
  const supportedValues = envVariableInfo.supportedValues;
  if (value !== undefined && supportedValues !== undefined) {
    if (
      supportedValues.canBeJoinedAsList === true &&
      !value
        .split(ENV_LIST_SPLIT_CHARACTER)
        .filter((a) => a.length > 0)
        .every((a) => supportedValues.values.includes(a)) &&
      value !== supportedValues.emptyListValue
    ) {
      throw Error(
        `The provided value list for "${envVariableName}" is not supported (${supportedValues.values
          .map((a) => `"${a}"`)
          .join(ENV_LIST_SPLIT_CHARACTER)})${
          supportedValues.emptyListValue !== undefined
            ? ` [empty list value "${supportedValues.emptyListValue}"]`
            : ""
        }`
      );
    }
    if (
      supportedValues.canBeJoinedAsList !== true &&
      !supportedValues.values.includes(value)
    ) {
      throw Error(
        `The provided value for "${envVariableName}" is not supported (${supportedValues.values
          .map((a) => `"${a}"`)
          .join(",")})`
      );
    }
  }
  if (envVariableInfo.required === true && value === undefined) {
    throw Error(
      `No value was found for the required ENV variable "${envVariableName}"`
    );
  }
  return { envVariableName, legacy, value };
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
  content: string;
  name: string;
}
export interface EnvVariableStructureVariablesBlock {
  block: EnvVariableBlock;
  description: string;
  name: string;
}

export const envVariableStructure: (
  | EnvVariableStructureTextBlock
  | EnvVariableStructureVariablesBlock
)[] = [
  {
    content:
      "This is an example config file for the MoonpieBot that contains all environment variables that the bot uses.",
    name: "File description",
  },
  {
    content:
      "You can either set the variables yourself or copy this file, rename it from `.env.example` to `.env` and edit it with your own values since this is just an example to show how it should look.",
    name: "File purpose",
  },
  {
    content: `If a line that starts with '${ENV_VARIABLE_PREFIX}' has the symbol '#' in front of it that means it will be ignored as a comment. This means you can add custom comments and easily enable/disable any '${ENV_VARIABLE_PREFIX}' option by adding or removing that symbol.`,
    name: "How to edit file",
  },
  {
    block: EnvVariableBlock.LOGGING,
    description: "Customize how much and where should be logged.",
    name: "LOGGING",
  },
  {
    block: EnvVariableBlock.TWITCH,
    description:
      "Required variables that need to be set for ANY configuration to connect to Twitch chat.",
    name: "TWITCH",
  },
  {
    block: EnvVariableBlock.MOONPIE,
    description:
      "Customize the moonpie functionality that is enabled per default.",
    name: "MOONPIE",
  },
  {
    block: EnvVariableBlock.OSU,
    description: "Optional osu! commands that can be enabled.",
    name: "OSU",
  },
  {
    block: EnvVariableBlock.OSU_API,
    description:
      "Optional osu! API connection that can be enabled to use more osu! commands or detect beatmap requests.",
    name: "OSU API",
  },
  {
    block: EnvVariableBlock.OSU_STREAM_COMPANION,
    description:
      "Optional osu! StreamCompanion connection that can be enabled for a much better !np command.",
    name: "OSU STREAM COMPANION",
  },
  {
    block: EnvVariableBlock.SPOTIFY,
    description: "Optional Spotify commands that can be enabled.",
    name: "SPOTIFY",
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    description:
      "Optional Spotify API connection that can be enabled to use Spotify commands.",
    name: "SPOTIFY API",
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    description:
      "Optional Twitch API connection that can be enabled for advanced custom commands that for example set/get the current game/title.",
    name: "Twitch API",
  },
];

export const createEnvVariableDocumentation = async (
  path: string,
  configDir: string
) => {
  const data: FileDocumentationParts[] = [];

  for (const structurePart of envVariableStructure) {
    if (!(structurePart as EnvVariableStructureVariablesBlock)?.block) {
      // Just a text block
      const structurePartText = structurePart as EnvVariableStructureTextBlock;
      data.push({
        content: structurePartText.content,
        type: FileDocumentationPartType.TEXT,
      });
    } else {
      // Variable documentation block
      const structurePartVariables =
        structurePart as EnvVariableStructureVariablesBlock;
      data.push({
        count: 1,
        type: FileDocumentationPartType.NEWLINE,
      });
      data.push({
        description: structurePartVariables.description,
        title: structurePartVariables.name,
        type: FileDocumentationPartType.HEADING,
      });

      // Now add for each variable of the block the documentation
      for (const envVariable in EnvVariable) {
        const envVariableInfo = getEnvVariableValueInformation(envVariable);
        if (envVariableInfo?.block === structurePartVariables.block) {
          const envVariableEntry: FileDocumentationPartValue = {
            description: envVariableInfo.description,
            prefix: ">",
            type: FileDocumentationPartType.VALUE,
          };
          if (
            envVariableInfo.supportedValues &&
            envVariableInfo.supportedValues.values.length > 0
          ) {
            if (envVariableEntry.properties === undefined) {
              envVariableEntry.properties = [];
            }
            envVariableEntry.properties.push([
              `Supported ${
                envVariableInfo.supportedValues.canBeJoinedAsList ? "list " : ""
              }values`,
              envVariableInfo.supportedValues.values
                .map((a) => `'${a}'`)
                .sort()
                .join(", "),
            ]);
            if (envVariableInfo.supportedValues.emptyListValue) {
              envVariableEntry.properties.push([
                "Empty list value",
                `'${envVariableInfo.supportedValues.emptyListValue}'`,
              ]);
            }
          }
          envVariableEntry.infos = [];
          if (envVariableInfo.required) {
            envVariableEntry.infos.push("THIS VARIABLE IS REQUIRED!");
          }
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
            envVariableEntry.isComment = !envVariableInfo.required;
          } else if (envVariableInfo.example) {
            envVariableEntry.infos.push(
              "(The following line is only an example!)"
            );
            envVariableEntry.value = `${ENV_VARIABLE_PREFIX}${envVariable}=${envVariableInfo.example}`;
            envVariableEntry.isComment = !envVariableInfo.required;
          } else {
            envVariableEntry.value = "ERROR";
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
