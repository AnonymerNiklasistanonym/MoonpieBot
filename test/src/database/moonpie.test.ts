// Package imports
import { describe } from "mocha";
// Local imports
import moonpieDbBackup from "./moonpie/backup.test";
import moonpieDbRequests from "./moonpie/requests.test";

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("moonpie", () => {
    moonpieDbRequests(databaseDirPath);
    moonpieDbBackup(databaseDirPath);
  });
};
