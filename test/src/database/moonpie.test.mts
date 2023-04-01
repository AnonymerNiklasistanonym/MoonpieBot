// Package imports
import { describe } from "mocha";
// Relative imports
import moonpieDbBackup from "./moonpie/backup.test.mjs";
import moonpieDbRequests from "./moonpie/requests.test.mjs";
// Type imports
import type { Suite } from "mocha";

export default (databaseDirPath: string): Suite => {
  return describe("moonpie", () => {
    moonpieDbRequests(databaseDirPath);
    moonpieDbBackup(databaseDirPath);
  });
};
