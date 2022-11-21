// Package imports
import db from "sqlite3-promise-query-api";
// Local imports
import { compareVersions, getVersionString } from "../../version";
import {
  OsuRequestsConfig,
  osuRequestsConfigTable,
  osuRequestsConfigTableV001,
  versionCurrent,
} from "../../info/databases/osuRequestsDb";
import { createLogMethod } from "../logging";
import { createOrUpdateEntry } from "./requests/osuRequestsConfig";
import { genericSetupDatabase } from "../generic/setup";
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
    [osuRequestsConfigTable],
    [],
    versionCurrent,
    {
      migrateVersion: async (oldVersion, currentVersion) => {
        if (oldVersion !== undefined) {
          if (
            compareVersions(oldVersion, { major: 0, minor: 0, patch: 1 }) ===
              0 &&
            compareVersions(currentVersion, {
              major: 0,
              minor: 0,
              patch: 2,
            }) === 0
          ) {
            // Alter table to drop channel column that was in version 0.0.1 but
            // got removed in version 0.0.2
            const logMethod = createLogMethod(
              logger,
              "database_osu_requests_migrate_001_002"
            );
            // Since the column to drop is a primary key column the table needs
            // to be renamed and the data needs to be copied.
            const oldEntries = await db.requests.getAll<
              Record<"option" | "optionValue" | "channel", string>
            >(
              databasePath,
              db.queries.select(osuRequestsConfigTableV001.name, [
                {
                  alias: "option",
                  columnName: osuRequestsConfigTableV001.columns.option.name,
                },
                {
                  alias: "optionValue",
                  columnName:
                    osuRequestsConfigTableV001.columns.optionValue.name,
                },
                {
                  alias: "channel",
                  columnName:
                    osuRequestsConfigTableV001.columns.twitchChannel.name,
                },
              ]),
              undefined,
              logMethod
            );
            // Validate if the entries are still valid
            for (const oldEntry of oldEntries) {
              if (
                !Object.values(OsuRequestsConfig)
                  .map((a) => a.toString())
                  .includes(oldEntry.option)
              ) {
                throw Error(
                  "Could not successfully migrate database because the " +
                    `option is unknown: '${oldEntry.option}' (${Object.values(
                      OsuRequestsConfig
                    ).join(",")})`
                );
              }
            }
            // Now rename the data but don't drop it in case of errors
            await db.requests.post(
              databasePath,
              db.queries.alterTable(osuRequestsConfigTableV001.name, {
                newTableName: `${osuRequestsConfigTableV001.name}_old_v001`,
              }),
              undefined,
              logMethod
            );
            // Create the current table
            await db.requests.post(
              databasePath,
              db.queries.createTable(
                osuRequestsConfigTable.name,
                Object.values(osuRequestsConfigTable.columns)
              ),
              undefined,
              logMethod
            );
            // Copy the data from the old table to the new table
            for (const oldEntry of oldEntries) {
              await createOrUpdateEntry(
                databasePath,
                {
                  option: oldEntry.option as unknown as OsuRequestsConfig,
                  optionValue: oldEntry.optionValue,
                },
                logger
              );
            }
            logger.info(
              `Successfully migrated '${databasePath}' from ${getVersionString(
                oldVersion,
                ""
              )} to ${getVersionString(currentVersion, "")}`
            );
            return;
          }
        }
        throw Error(
          `No database migration was found (old=${
            oldVersion !== undefined ? getVersionString(oldVersion, "") : "none"
          },current=${getVersionString(currentVersion, "")})!`
        );
      },
    },
    logger
  );
