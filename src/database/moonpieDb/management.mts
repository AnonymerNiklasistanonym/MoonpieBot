// Relative imports
import { compareVersions, getVersionString } from "../../version.mjs";
import {
  moonpieCountIndex,
  moonpieLeaderboardView,
  moonpieTable,
  versionCurrent,
} from "../../info/databases/moonpieDb.mjs";
import { createLogMethod } from "../logging.mjs";
import db from "sqlite3-promise-query-api";
import { genericSetupDatabase } from "../generic/setup.mjs";
// Type imports
import type { Logger } from "winston";
import type { MigrateDatabaseInformation } from "../generic/setup.mjs";

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
    [moonpieTable],
    [moonpieLeaderboardView],
    [moonpieCountIndex],
    versionCurrent,
    {
      migrateVersion: async (oldVersion, currentVersion) => {
        const migrations: MigrateDatabaseInformation[] = [];
        if (
          compareVersions(oldVersion, { major: 0, minor: 0, patch: 2 }) === -1
        ) {
          // Create index that was added in version 0.0.2
          const logMethod = createLogMethod(
            logger,
            "database_moonpie_migrate_00x_002"
          );
          await db.default.requests.post(
            databasePath,
            db.default.queries.createIndex(
              moonpieCountIndex.name,
              moonpieCountIndex.tableName,
              moonpieCountIndex.columns,
              true,
              moonpieCountIndex.where
            ),
            undefined,
            logMethod
          );
          migrations.push({
            name: "moonpie count index",
            relatedVersion: { major: 0, minor: 0, patch: 2 },
            type: "added",
          });
        }
        if (migrations.length > 0) {
          return migrations;
        }
        throw Error(
          `No database migration was found (old=${getVersionString(
            oldVersion,
            ""
          )},current=${getVersionString(currentVersion, "")})!`
        );
      },
    },
    logger
  );
