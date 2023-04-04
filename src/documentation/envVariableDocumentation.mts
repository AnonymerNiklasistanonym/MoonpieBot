/**
 * Environment variable handling.
 */

// Package imports
import path from "path";
// Relative imports
import { ENV_PREFIX, EnvVariable, envVariableStructure } from "../info/env.mjs";
import {
  fileDocumentationGenerator,
  FileDocumentationPartType,
} from "../documentation/fileDocumentationGenerator.mjs";
import { getEnvVariableName, getEnvVariableValueInformation } from "../env.mjs";
import { convertRegexToHumanStringDetailed } from "../other/regexToString.mjs";
import { escapeWhitespaceEnvVariableValue } from "../other/whiteSpaceChecker.mjs";
import { genericFilterNonUniqueStrings } from "../other/genericStringSorter.mjs";
import { getCustomEnvValueFromLoggerConfig } from "../info/config/loggerConfig.mjs";
import { getCustomEnvValueFromMoonpieConfig } from "../info/config/moonpieConfig.mjs";
// Type imports
import type { DeepReadonly } from "../other/types.mjs";
import type { FileDocumentationParts } from "../documentation/fileDocumentationGenerator.mjs";
import type { LoggerConfig } from "../info/config/loggerConfig.mjs";
import type { MoonpieConfig } from "../info/config/moonpieConfig.mjs";

export interface CreateEnvVariableDocumentationOptions {
  createExampleConfigDocumentation?: boolean;
}

export const createEnvVariableDocumentation = (
  configDir: string,
  loggerConfig?: DeepReadonly<LoggerConfig>,
  moonpieConfig?: DeepReadonly<MoonpieConfig>,
  options: Readonly<CreateEnvVariableDocumentationOptions> = {},
): string => {
  const data: FileDocumentationParts[] = [];
  const documentWithCustomConfigValues =
    loggerConfig !== undefined || moonpieConfig !== undefined;

  for (const structurePart of envVariableStructure) {
    const blockData: FileDocumentationParts[] = [];
    // Check if there are any non default values set
    let nonDefaultValueFound = false;

    // Skip structure parts that should only appear i example files
    if (structurePart.exampleFile && documentWithCustomConfigValues) {
      continue;
    }
    // Variable documentation block
    if ("block" in structurePart) {
      blockData.push({
        count: 1,
        type: FileDocumentationPartType.NEWLINE,
      });
      blockData.push({
        description: structurePart.content,
        title: structurePart.name,
        type: FileDocumentationPartType.HEADING,
      });

      // Now add for each variable of the block the documentation
      for (const envVariable in EnvVariable) {
        const envVariableInfo = getEnvVariableValueInformation(envVariable);
        if (envVariableInfo.block === structurePart.block) {
          const envInfos: string[] = [];
          if (
            envVariableInfo.supportedValues &&
            envVariableInfo.supportedValues.values.length > 0
          ) {
            envInfos.push(
              `Supported ${
                envVariableInfo.supportedValues.canBeJoinedAsList ? "list " : ""
              }values: ${envVariableInfo.supportedValues.values
                .map((a) => `'${typeof a === "string" ? a : a.id}'`)
                .filter(genericFilterNonUniqueStrings)
                .sort()
                .join(", ")}`,
            );
            for (const supportedValue of envVariableInfo.supportedValues
              .values) {
              if (
                typeof supportedValue === "string" ||
                options.createExampleConfigDocumentation
              ) {
                continue;
              }
              envInfos.push(
                `- ${supportedValue.id}: ${supportedValue.description}`,
              );
              envInfos.push(
                `  (${supportedValue.permission}: ${
                  typeof supportedValue.command === "string"
                    ? supportedValue.command
                    : convertRegexToHumanStringDetailed(supportedValue.command)
                })`,
              );
            }
            if (envVariableInfo.supportedValues.emptyListValue) {
              envInfos.push(
                `Empty list value: '${envVariableInfo.supportedValues.emptyListValue}'`,
              );
            }
          }
          if (
            options.createExampleConfigDocumentation !== true &&
            envVariableInfo.legacyNames &&
            envVariableInfo.legacyNames.length > 0
          ) {
            envInfos.push(
              `Legacy name${
                envVariableInfo.legacyNames.length > 1 ? "s" : ""
              }: ${envVariableInfo.legacyNames
                .map(getEnvVariableName)
                .map((a) => `'${a}'`)
                .join(", ")}`,
            );
          }
          if (envVariableInfo.required) {
            envInfos.push("THIS VARIABLE IS REQUIRED!");
          }
          if (envVariableInfo.censor) {
            envInfos.push("KEEP THIS VARIABLE PRIVATE!");
          }
          let value = "ERROR";
          let defaultConfigValue: string | undefined;
          if (envVariableInfo.default) {
            const defaultStrOrFunc = envVariableInfo.default;
            defaultConfigValue =
              typeof defaultStrOrFunc === "function"
                ? defaultStrOrFunc(configDir)
                : defaultStrOrFunc;
          }
          let defaultConfigValueValue: string | undefined;
          if (envVariableInfo.defaultValue) {
            const defaultStrOrFuncValue = envVariableInfo.defaultValue;
            defaultConfigValueValue =
              typeof defaultStrOrFuncValue === "function"
                ? defaultStrOrFuncValue(configDir)
                : defaultStrOrFuncValue;
          }
          let customConfigValue: string | undefined;
          if (loggerConfig !== undefined && customConfigValue === undefined) {
            customConfigValue = getCustomEnvValueFromLoggerConfig(
              envVariable,
              loggerConfig,
            );
          }
          if (moonpieConfig !== undefined && customConfigValue === undefined) {
            customConfigValue = getCustomEnvValueFromMoonpieConfig(
              envVariable,
              moonpieConfig,
            );
          }
          if (
            customConfigValue !== undefined &&
            customConfigValue !== defaultConfigValue &&
            customConfigValue !== defaultConfigValueValue
          ) {
            if (defaultConfigValue !== undefined) {
              envInfos.push(
                `(Default value: ${escapeWhitespaceEnvVariableValue(
                  defaultConfigValue,
                )})`,
              );
            }
            value = `${ENV_PREFIX}${envVariable}=${escapeWhitespaceEnvVariableValue(
              defaultConfigValueValue !== undefined
                ? path.relative(configDir, customConfigValue)
                : customConfigValue,
            )}`;
          } else if (defaultConfigValue !== undefined) {
            value = `${ENV_PREFIX}${envVariable}=${escapeWhitespaceEnvVariableValue(
              defaultConfigValue,
            )}`;
          } else if (envVariableInfo.example) {
            envInfos.push("(The following line is only an example!)");
            value = `${ENV_PREFIX}${envVariable}=${escapeWhitespaceEnvVariableValue(
              envVariableInfo.example,
            )}`;
          }
          const isComment = !(
            envVariableInfo.required ||
            (customConfigValue !== undefined &&
              customConfigValue !== defaultConfigValue &&
              customConfigValue !== defaultConfigValueValue)
          );
          if (options.createExampleConfigDocumentation && isComment) {
            continue;
          } else {
            nonDefaultValueFound = true;
          }
          blockData.push({
            description: {
              infos: envInfos,
              prefix: ">",
              text: envVariableInfo.description,
            },
            // Do not comment value line if required or custom value exists
            isComment,
            type: FileDocumentationPartType.VALUE,
            value,
          });
        }
      }
    } else if (options.createExampleConfigDocumentation !== true) {
      // Just a text block
      blockData.push({
        text: structurePart.content,
        type: FileDocumentationPartType.TEXT,
      });
    }
    if (options.createExampleConfigDocumentation && !nonDefaultValueFound) {
      continue;
    }
    data.push(...blockData);
  }

  return fileDocumentationGenerator(data);
};
