// Local imports
import { moonpieLeaderboardView, moonpieTable, versionCurrent } from "./info";
import { genericSetupDatabase } from "../generic/setup";
import { getVersionFromObject } from "../../version";
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
  logger: Logger
): Promise<void> =>
  genericSetupDatabase(
    databasePath,
    [moonpieTable],
    [moonpieLeaderboardView],
    versionCurrent,
    {
      migrateVersion: (oldVersion, currentVersion) => {
        throw Error(
          `No database migration was found (old=${
            oldVersion !== undefined
              ? getVersionFromObject(oldVersion, "")
              : "none"
          },current=${getVersionFromObject(currentVersion, "")})!`
        );
      },
    },
    logger
  );
