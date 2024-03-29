// Local imports
import {
  customBroadcastsTable,
  customCommandsTable,
  customDataTable,
  versionCurrent,
} from "../../info/databases/customCommandsBroadcastsDb";
//import { customBroadcastsInformation } from "../../info/customBroadcasts";
//import customCommandsBroadcastsDb from "../customCommandsBroadcastsDb";
//import { customCommandsInformation } from "../../info/customCommands";
import { genericSetupDatabase } from "../generic/setup";
import { getVersionString } from "../../version";
// Type imports
import type { Logger } from "winston";

/**
 * Create tables if not existing and set them up with data.
 *
 * @param databasePath Path to database.
 * @param logger Logger (for global logs).
 */
export const setup = async (
  databasePath: string,
  logger: Readonly<Logger>
): Promise<void> =>
  genericSetupDatabase(
    databasePath,
    [customCommandsTable, customDataTable, customBroadcastsTable],
    [],
    [],
    versionCurrent,
    {
      migrateVersion: (oldVersion, currentVersion) => {
        throw Error(
          `No database migration was found (old=${
            oldVersion !== undefined ? getVersionString(oldVersion, "") : "none"
          },current=${getVersionString(currentVersion, "")})!`
        );
      },
      /*
      setupInitialData: async () => {
        for (const exampleEntry of customCommandsInformation) {
          await customCommandsBroadcastsDb.requests.customCommand.createEntry(
            databasePath,
            {
              cooldownInS: exampleEntry.cooldownInS,
              count: exampleEntry.count,
              description: exampleEntry.description,
              id: exampleEntry.id,
              message: exampleEntry.message,
              regex: exampleEntry.regex,
              userLevel: exampleEntry.userLevel,
            },
            logger
          );
        }
        for (const exampleEntry of customBroadcastsInformation) {
          await customCommandsBroadcastsDb.requests.customBroadcast.createEntry(
            databasePath,
            {
              cronString: exampleEntry.cronString,
              description: exampleEntry.description,
              id: exampleEntry.id,
              message: exampleEntry.message,
            },
            logger
          );
        }
      },
      */
    },
    logger
  );
