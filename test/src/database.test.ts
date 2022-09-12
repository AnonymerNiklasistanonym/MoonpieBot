// Package imports
import { mkdirSync, rmSync as rm } from "fs";
import { describe } from "mocha";
import os from "os";
import path from "path";
// Local imports
import moonpie from "./database/moonpie.test";

describe("database", () => {
  const databaseDirPath = path.join(os.tmpdir(), "moonpiebot");
  rm(databaseDirPath, { force: true, recursive: true });
  mkdirSync(databaseDirPath, { recursive: true });

  moonpie(databaseDirPath);
});
