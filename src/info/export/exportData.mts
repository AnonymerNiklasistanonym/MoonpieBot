// Relative imports
import { createConsoleLogger, LoggerLevel } from "../../logging.mjs";
import { defaultMacros, defaultMacrosOptional } from "../macros.mjs";
import { defaultPlugins, defaultPluginsOptional } from "../plugins.mjs";
import {
  fileDocumentationGenerator,
  FileDocumentationPartType,
} from "../../documentation/fileDocumentationGenerator.mjs";
import {
  getMoonpieConfigFromEnv,
  getMoonpieConfigMoonpieFromEnv,
} from "../config/moonpieConfig.mjs";
import { createCustomCommandsBroadcastsDocumentation } from "../../documentation/customCommandsBroadcasts.mjs";
import { createEnvVariableDocumentation } from "../../env.mjs";
import { createOsuRequestsConfigDocumentation } from "../../documentation/osuRequestsConfig.mjs";
import { createStringsVariableDocumentation } from "../../documentation/strings.mjs";
import customCommandsBroadcastsDb from "../../database/customCommandsBroadcastsDb.mjs";
import { defaultStringMap } from "../../info/strings.mjs";
import { genericStringSorter } from "../../other/genericStringSorter.mjs";
import { getLoggerConfigFromEnv } from "../../info/config/loggerConfig.mjs";
import moonpieDb from "../../database/moonpieDb.mjs";
import { name } from "../general.mjs";
import osuRequestsDb from "../../database/osuRequestsDb.mjs";
import { updateStringsMapWithCustomEnvStrings } from "../../messageParser.mjs";
// Type imports
import type { ExportData } from "../../export.mjs";
import type { FileDocumentationPartValue } from "../../documentation/fileDocumentationGenerator.mjs";
import type { MoonpieConfigCustomData } from "../config/moonpieConfig.mjs";

export const exportDataEnv: ExportData<MoonpieConfigCustomData> = async (
  configDir,
  json,
  customData
): Promise<string> => {
  const loggerConfig = await getLoggerConfigFromEnv(configDir);
  const moonpieConfig = await getMoonpieConfigFromEnv(configDir, customData);
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
    createConsoleLogger(name, LoggerLevel.OFF)
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
    createConsoleLogger(name, LoggerLevel.OFF),
    updatedStringsMap
  );
};

const setMoonpieCommandBuilder = (user: string, count: number): string =>
  `!moonpie set ${user} ${count}`;

export const exportDataMoonpie: ExportData = async (configDir, json) => {
  const config = await getMoonpieConfigMoonpieFromEnv(configDir);
  await moonpieDb.setup(
    config.databasePath,
    createConsoleLogger(name, LoggerLevel.OFF)
  );
  const moonpieCounts = await moonpieDb.backup.exportMoonpieCountTableToJson(
    config.databasePath,
    createConsoleLogger(name, LoggerLevel.OFF)
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

export const exportDataCustomCommandsBroadcasts: ExportData = async (
  configDir,
  json
) => {
  const config = await getMoonpieConfigFromEnv(configDir);
  if (config.customCommandsBroadcasts?.databasePath === undefined) {
    throw Error("custom commands broadcasts database path not found");
  }
  await customCommandsBroadcastsDb.setup(
    config.customCommandsBroadcasts.databasePath,
    createConsoleLogger(name, LoggerLevel.OFF)
  );
  const customCommands =
    await customCommandsBroadcastsDb.requests.customCommand.getEntries(
      config.customCommandsBroadcasts.databasePath,
      undefined,
      createConsoleLogger(name, LoggerLevel.OFF)
    );
  const customBroadcasts =
    await customCommandsBroadcastsDb.requests.customBroadcast.getEntries(
      config.customCommandsBroadcasts.databasePath,
      undefined,
      createConsoleLogger(name, LoggerLevel.OFF)
    );
  const customData =
    await customCommandsBroadcastsDb.requests.customData.getEntries(
      config.customCommandsBroadcasts.databasePath,
      createConsoleLogger(name, LoggerLevel.OFF)
    );
  if (json) {
    return JSON.stringify({
      customBroadcasts,
      customCommands,
      customData,
    });
  }
  return createCustomCommandsBroadcastsDocumentation(
    customCommands,
    customBroadcasts,
    false
  );
};

export const exportDataOsuRequests: ExportData = async (configDir, json) => {
  const config = await getMoonpieConfigFromEnv(configDir);
  if (config.osuApi?.databasePath === undefined) {
    throw Error("osu! API database path not found");
  }
  await osuRequestsDb.setup(
    config.osuApi.databasePath,
    createConsoleLogger(name, LoggerLevel.OFF)
  );
  const osuRequestsConfig =
    await osuRequestsDb.requests.osuRequestsConfig.getEntries(
      config.osuApi.databasePath,
      createConsoleLogger(name, LoggerLevel.OFF)
    );
  if (json) {
    return JSON.stringify({
      osuRequestsConfig,
    });
  }
  return createOsuRequestsConfigDocumentation(osuRequestsConfig);
};
