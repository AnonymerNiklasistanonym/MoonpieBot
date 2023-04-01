// Relative imports
import { createConsoleLogger } from "../../src/logging.mjs";
import { name } from "../../src/info/general.mjs";
// Type imports
import type { Logger } from "winston";

export const getTestLogger = (testName: string): Logger =>
  createConsoleLogger(`${name}_Test_${testName}`);
