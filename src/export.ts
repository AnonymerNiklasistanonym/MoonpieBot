// Local imports
import { defaultMacros, defaultMacrosOptional } from "./info/macros";
import { defaultPlugins, defaultPluginsOptional } from "./info/plugins";
import {
  getMoonpieConfigFromEnv,
  getMoonpieConfigMoonpieFromEnv,
} from "./info/config/moonpieConfig";
import { createConsoleLogger } from "./logging";
import { createEnvVariableDocumentation } from "./env";
import { createStringsVariableDocumentation } from "./documentation/strings";
import { defaultStringMap } from "./info/strings";
import { getLoggerConfigFromEnv } from "./info/config/loggerConfig";
import moonpieDb from "./database/moonpieDb";
import { name } from "./info/general";
import { updateStringsMapWithCustomEnvStrings } from "./messageParser";

export type ExportData = (
  configDir: string,
  json?: boolean
) => string | Promise<string>;

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

export const exportDataMoonpie: ExportData = async (configDir, json) => {
  if (json) {
    const config = getMoonpieConfigMoonpieFromEnv(configDir);
    await moonpieDb.setup(
      config.databasePath,
      createConsoleLogger(name, "off")
    );
    return JSON.stringify({
      databasePath: config.databasePath,
      moonpieCounts: await moonpieDb.backup.exportMoonpieCountTableToJson(
        config.databasePath,
        createConsoleLogger(name, "off")
      ),
    });
  }
  // TODO
  throw Error("TODO");
};

export const exportDataCustomCommandsBroadcasts: ExportData = () => {
  // TODO
  throw Error("TODO");
};
export const exportDataOsuRequests: ExportData = () => {
  // TODO
  throw Error("TODO");
};
export const exportDataSpotify: ExportData = () => {
  // TODO
  throw Error("TODO");
};
