// Local imports
import { createConsoleLogger } from "../../src/logging";
import { name } from "../../src/info/general";
// Type imports
import type { Logger } from "winston";

export const getTestLogger = (testName: string): Logger =>
  createConsoleLogger(`${name}_Test_${testName}`);
