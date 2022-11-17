// Local imports
import { defaultMacros, defaultMacrosOptional } from "../macros";
import { defaultPlugins, defaultPluginsOptional } from "../plugins";
import {
  fileDocumentationGenerator,
  FileDocumentationPartType,
} from "../../documentation/fileDocumentationGenerator";
import {
  getMoonpieConfigFromEnv,
  getMoonpieConfigMoonpieFromEnv,
} from "../config/moonpieConfig";
import { createConsoleLogger } from "../../logging";
import { createEnvVariableDocumentation } from "../../env";
import { createStringsVariableDocumentation } from "../../documentation/strings";
import { defaultStringMap } from "../../info/strings";
import { genericStringSorter } from "../../other/genericStringSorter";
import { getLoggerConfigFromEnv } from "../../info/config/loggerConfig";
import moonpieDb from "../../database/moonpieDb";
import { name } from "../general";
import { updateStringsMapWithCustomEnvStrings } from "../../messageParser";
// Type imports
import type { ExportData } from "../../export";
import type { FileDocumentationPartValue } from "../../documentation/fileDocumentationGenerator";

export const exportDataEnv: ExportData = (configDir, json) => {
  const loggerConfig = getLoggerConfigFromEnv(configDir);
  const moonpieConfig = getMoonpieConfigFromEnv(configDir);
  if (json) {
    return JSON.stringify({
      configDir,
      loggerConfig,
      moonpieConfig,
    });
  }
  return createEnvVariableDocumentation(configDir, loggerConfig, moonpieConfig);
};

export const exportDataEnvStrings: ExportData = async (_configDir, json) => {
  const updatedStringsMap = updateStringsMapWithCustomEnvStrings(
    defaultStringMap,
    createConsoleLogger(name, "off")
  );
  if (json) {
    const updatedStrings = Array.from(updatedStringsMap);
    return JSON.stringify({
      customStrings: updatedStrings
        .filter((a) => a[1].updated === true && a[1].custom === true)
        .map((a) => ({ id: a[0], value: a[1].default })),
      defaultStrings: Array.from(defaultStringMap).map((a) => ({
        ...a[1],
        id: a[0],
      })),
      updatedStrings: updatedStrings
        .filter((a) => a[1].updated === true && a[1].custom !== true)
        .map((a) => ({ id: a[0], value: a[1].default })),
    });
  }
  return await createStringsVariableDocumentation(
    defaultStringMap,
    defaultPlugins,
    defaultMacros,
    defaultPluginsOptional,
    defaultMacrosOptional,
    createConsoleLogger(name, "off"),
    updatedStringsMap
  );
};

const setMoonpieCommandBuilder = (user: string, count: number): string =>
  `!moonpie set ${user} ${count}`;

export const exportDataMoonpie: ExportData = async (configDir, json) => {
  const config = getMoonpieConfigMoonpieFromEnv(configDir);
  await moonpieDb.setup(config.databasePath, createConsoleLogger(name, "off"));
  const moonpieCounts = await moonpieDb.backup.exportMoonpieCountTableToJson(
    config.databasePath,
    createConsoleLogger(name, "off")
  );
  if (json) {
    return JSON.stringify({
      databasePath: config.databasePath,
      moonpieCounts,
    });
  }
  return fileDocumentationGenerator([
    {
      text: "This file contains all current moonpies:",
      type: FileDocumentationPartType.TEXT,
    },
    { count: 1, type: FileDocumentationPartType.NEWLINE },
    ...moonpieCounts
      .sort((a, b) => genericStringSorter(a.name, b.name))
      .map<FileDocumentationPartValue>((a) => ({
        type: FileDocumentationPartType.VALUE,
        value: setMoonpieCommandBuilder(a.name, a.count),
      })),
  ]);
};

export const exportDataCustomCommandsBroadcasts: ExportData = () => {
  // TODO
  throw Error("TODO");
};
export const exportDataOsuRequests: ExportData = () => {
  // TODO
  throw Error("TODO");
};
