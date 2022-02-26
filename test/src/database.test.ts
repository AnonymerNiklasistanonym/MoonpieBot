import databaseManagement from "./database/management.test";
import databaseQueries from "./database/queries.test";
import databaseRequests from "./database/requests.test";
import { describe } from "mocha";
import os from "os";
import path from "path";
import { rmSync as rm, mkdirSync } from "fs";

describe("database", () => {
  const databaseDirPath = path.join(os.tmpdir(), "moonpiebot");
  rm(databaseDirPath, { recursive: true, force: true });
  mkdirSync(databaseDirPath, { recursive: true });

  databaseManagement(databaseDirPath);
  databaseQueries();
  databaseRequests(databaseDirPath);
});