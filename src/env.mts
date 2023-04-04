/**
 * Environment variable handling.
 */

// Package imports
import dotenv from "dotenv";
import path from "path";
// Relative imports
import {
  ENV_LIST_SPLIT_CHARACTER,
  ENV_PREFIX,
  EnvVariable,
  envVariableInformation,
} from "./info/env.mjs";
import { fileNameEnv, fileNameEnvStrings } from "./info/files.mjs";
// Type imports
import type { CliEnvVariableInformation } from "./cli.mjs";
import type { DeepReadonly } from "./other/types.mjs";

export interface EnvVariableStructureTextBlock {
  /** The description of the text block. */
  content: string;
  /** Set true if it should only appear in example files. */
  exampleFile?: boolean;
  /** The name of the text block. */
  name: string;
}
export interface EnvVariableStructureVariablesBlock<BLOCK = string>
  extends EnvVariableStructureTextBlock {
  block: BLOCK;
}

export type EnvVariableStructureElement<BLOCK = string> =
  | EnvVariableStructureTextBlock
  | EnvVariableStructureVariablesBlock<BLOCK>;

const CENSORED_CUSTOM_ENV_VALUE = "*******[secret]********";

/**
 * Print all environment variables to the console plus if found a custom value.
 *
 * @param configDir The configuration directory.
 * @param censor Should the custom values be censored or not.
 */
export const printEnvVariablesToConsole = (
  configDir: string,
  censor = true,
): void => {
  for (const envVariable in EnvVariable) {
    // eslint-disable-next-line security/detect-object-injection
    const envVariableName = getEnvVariableName(envVariable);
    const envVariableValue = getEnvVariableValue(envVariable);
    let legacyString;

    const envVariableInfo = getEnvVariableValueInformation(envVariable);
    let envVariableValueString;
    if (envVariableValue.value) {
      envVariableValueString = `"${envVariableValue.value}"`;
      if (censor && envVariableInfo.censor) {
        // Censor secret variables per default
        envVariableValueString = CENSORED_CUSTOM_ENV_VALUE;
      }
      if (envVariableValue.value.length === 0) {
        envVariableValueString = undefined;
      }

      // Add note if the value was derived via a legacy variable
      if (envVariableValue.legacy) {
        if (envVariableValue.envVariableName === undefined) {
          throw Error("No ENV variable name found while a value was given");
        }
        const legacyEnvVariableName = getEnvVariableName(
          envVariableValue.envVariableName,
        );
        legacyString =
          "THE VALUE WAS DERIVED FROM A DEPRECATED NAME!\n" +
          `Please change the name '${legacyEnvVariableName}'\nto '${envVariableName}'`;
      }
    } else if (envVariableInfo.default) {
      const defaultStringOrFunc = envVariableInfo.default;
      envVariableValueString = `Not found (default="${
        typeof defaultStringOrFunc === "function"
          ? defaultStringOrFunc(configDir)
          : defaultStringOrFunc
      }")`;
    }

    if (envVariableInfo.required) {
      if (envVariableValueString !== undefined) {
        envVariableValueString += " (REQUIRED!)";
      } else {
        envVariableValueString = "NOT FOUND BUT IS REQUIRED!";
      }
    }

    if (envVariableValueString !== undefined) {
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
  envVariable: EnvVariable | string,
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
          `Found a value for "${envVariable}" and it's legacy variable "${envVariable}" but only one is allowed`,
        );
      }
      if (legacyValue !== undefined && legacyEnvVariableName !== undefined) {
        throw Error(
          `Found multiple legacy values for "${envVariable}" ("${legacyEnvVariableName}", "${legacyName}") but only one is allowed`,
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
        .every((a) =>
          supportedValues.values
            .map((b) => (typeof b === "string" ? b : b.id))
            .includes(a),
        ) &&
      value !== supportedValues.emptyListValue
    ) {
      throw Error(
        `The provided value list${
          envVariableInfo.censor ? "" : ` "${value}"`
        } for "${envVariableName}" is not supported (${supportedValues.values
          .map((a) => `"${typeof a === "string" ? a : a.id}"`)
          .join(ENV_LIST_SPLIT_CHARACTER)})${
          supportedValues.emptyListValue !== undefined
            ? ` [empty list value "${supportedValues.emptyListValue}"]`
            : ""
        }`,
      );
    }
    if (
      supportedValues.canBeJoinedAsList !== true &&
      !supportedValues.values
        .map((a) => (typeof a === "string" ? a : a.id))
        .includes(value)
    ) {
      throw Error(
        `The provided value for "${envVariableName}" is not supported (${supportedValues.values
          .map((a) => `"${typeof a === "string" ? a : a.id}"`)
          .join(",")})`,
      );
    }
  }
  if (envVariableInfo.required === true && value === undefined) {
    throw Error(
      `No value was found for the required ENV variable "${envVariableName}"`,
    );
  }
  return { envVariableName, legacy, value };
};

export const getEnvVariableValueOrCustomDefault = <T extends unknown>(
  envVariable: EnvVariable,
  defaultValue: T,
): string | T => {
  const envValue = getEnvVariableValue(envVariable);
  if (envValue.value === undefined || envValue.value.trim().length === 0) {
    return defaultValue;
  }
  return envValue.value;
};
export const getEnvVariableValueOrUndefined = (
  envVariable: EnvVariable,
): string | undefined => {
  const envValue = getEnvVariableValue(envVariable);
  if (envValue.value === undefined || envValue.value.trim().length === 0) {
    return undefined;
  }
  return envValue.value;
};
export const getEnvVariableValueOrError = (
  envVariable: EnvVariable,
  errorMessage?: string,
): string => {
  const envValueOrUndefined = getEnvVariableValueOrUndefined(envVariable);
  if (envValueOrUndefined === undefined) {
    throw Error(
      errorMessage
        ? errorMessage
        : `No environment value was found for ${envVariable}`,
    );
  }
  return envValueOrUndefined;
};

export const getEnvVariableValueInformation = (
  envVariable: EnvVariable | string,
): DeepReadonly<CliEnvVariableInformation<EnvVariable>> => {
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
  configDir: string,
): string => {
  const value = getEnvVariableValue(envVariable);
  if (value.value === undefined || value.value.trim().length === 0) {
    return getEnvVariableValueDefault(envVariable, configDir);
  }
  return value.value;
};

export const getEnvVariableValueDefault = (
  envVariable: EnvVariable,
  configDir: string,
): string => {
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
};

/**
 * Get the actual name of the environment variable.
 *
 * @param envVariable The environment variable.
 * @returns The actual name of the environment variable.
 */
export const getEnvVariableName = (
  envVariable: EnvVariable | string,
): string => {
  return `${ENV_PREFIX}${envVariable}`;
};

export const dotenvLoadConfig = (configDir: string): void => {
  dotenv.config({
    debug: true,
    path: path.join(configDir, fileNameEnv),
  });
  dotenv.config({
    debug: true,
    path: path.join(configDir, fileNameEnvStrings),
  });
};
