// Package imports
import { describe } from "mocha";
// Local imports
import moonpieDbBackup from "./moonpie/backup.test";
import moonpieDbRequests from "./moonpie/requests.test";
// Type imports
import type { Suite } from "mocha";

export default (databaseDirPath: string): Suite => {
  return describe("moonpie", () => {
    moonpieDbRequests(databaseDirPath);
    moonpieDbBackup(databaseDirPath);
  });
};
