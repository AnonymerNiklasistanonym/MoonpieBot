import moonpieDbRequests from "./moonpie/requests.test";
import { describe } from "mocha";

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("moonpie", () => {
    moonpieDbRequests(databaseDirPath);
  });
};
