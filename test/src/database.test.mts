// Package imports
import { mkdirSync, rmSync } from "fs";
import { describe } from "mocha";
import os from "os";
import path from "path";
// Relative imports
import moonpie from "./database/moonpie.test.mjs";

describe("database", () => {
  const databaseDirPath = path.join(os.tmpdir(), "moonpiebot");
  rmSync(databaseDirPath, { force: true, recursive: true });
  mkdirSync(databaseDirPath, { recursive: true });

  moonpie(databaseDirPath);
});
