import moonpieDbRequests from "./moonpie/requests.test";
import moonpieDbBackup from "./moonpie/backup.test";
import { describe } from "mocha";

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("moonpie", () => {
    moonpieDbRequests(databaseDirPath);
    moonpieDbBackup(databaseDirPath);
  });
};
