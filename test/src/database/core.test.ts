import databaseManagement from "./core/management.test";
import databaseQueries from "./core/queries.test";
import databaseRequests from "./core/requests.test";
import { describe } from "mocha";

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("core", () => {
    databaseManagement(databaseDirPath);
    databaseQueries();
    databaseRequests(databaseDirPath);
  });
};
