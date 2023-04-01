// Relative imports
import {
  spotifyConfigTable,
  versionCurrent,
} from "../../info/databases/spotifyDb.mjs";
import { genericSetupDatabase } from "../generic/setup.mjs";
import { getVersionString } from "../../version.mjs";
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
    [spotifyConfigTable],
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
    },
    logger
  );
