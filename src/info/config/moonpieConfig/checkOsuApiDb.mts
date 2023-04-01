// Relative imports
import { createConsoleLogger, LoggerLevel } from "../../../logging.mjs";
import { fileExists } from "../../../other/fileOperations.mjs";
import { OsuRequestsConfig } from "../../databases/osuRequestsDb.mjs";
import osuRequestsDb from "../../../database/osuRequestsDb.mjs";

export const removeOsuApiDetailedRequestsIfFoundInDb = async (
  osuApiDatabasePath: string,
  osuApiDetailedRequests: undefined | boolean
): Promise<undefined | boolean> => {
  if (osuApiDetailedRequests === undefined) {
    return undefined;
  }
  if (!(await fileExists(osuApiDatabasePath))) {
    return osuApiDetailedRequests;
  }
  const consoleLogger = createConsoleLogger(
    "removeOsuApiDetailedRequestsIfFoundInDb",
    LoggerLevel.ERROR
  );
  await osuRequestsDb.setup(osuApiDatabasePath, consoleLogger);
  const entries = await osuRequestsDb.requests.osuRequestsConfig.getEntries(
    osuApiDatabasePath,
    consoleLogger
  );
  const detailedRequestsDb = entries.find(
    (a) => a.option === OsuRequestsConfig.DETAILED
  );
  const detailedRequestsIrcDb = entries.find(
    (a) => a.option === OsuRequestsConfig.DETAILED_IRC
  );
  if (
    detailedRequestsDb !== undefined &&
    detailedRequestsIrcDb !== undefined &&
    detailedRequestsDb.optionValue.toLowerCase() ===
      detailedRequestsIrcDb.optionValue.toLowerCase() &&
    detailedRequestsDb.optionValue.toLowerCase() ===
      (osuApiDetailedRequests ? "true" : "false")
  ) {
    return undefined;
  }
  return osuApiDetailedRequests;
};

export const removeOsuApiRequestsRedeemIdIfFoundInDb = async (
  osuApiDatabasePath: string,
  osuApiRequestsRedeemId: undefined | string
): Promise<undefined | string> => {
  if (osuApiRequestsRedeemId === undefined) {
    return undefined;
  }
  if (!(await fileExists(osuApiDatabasePath))) {
    return osuApiRequestsRedeemId;
  }
  const consoleLogger = createConsoleLogger(
    "removeOsuApiRequestsRedeemIdIfFoundInDb",
    LoggerLevel.ERROR
  );
  await osuRequestsDb.setup(osuApiDatabasePath, consoleLogger);
  const entries = await osuRequestsDb.requests.osuRequestsConfig.getEntries(
    osuApiDatabasePath,
    consoleLogger
  );
  const osuApiRequestsRedeemIdDb = entries.find(
    (a) => a.option === OsuRequestsConfig.REDEEM_ID
  );
  if (
    osuApiRequestsRedeemIdDb !== undefined &&
    osuApiRequestsRedeemIdDb.optionValue === osuApiRequestsRedeemId
  ) {
    return undefined;
  }
  return osuApiRequestsRedeemId;
};
