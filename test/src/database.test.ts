// Package imports
import { mkdirSync, rmSync as rm } from "fs";
import { describe } from "mocha";
import os from "os";
import path from "path";
// Local imports
import core from "./database/core.test";
import moonpie from "./database/moonpie.test";

describe("database", () => {
  const databaseDirPath = path.join(os.tmpdir(), "moonpiebot");
  rm(databaseDirPath, { recursive: true, force: true });
  mkdirSync(databaseDirPath, { recursive: true });

  core(databaseDirPath);
  moonpie(databaseDirPath);
});
