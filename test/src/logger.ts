// Package imports
import winston, { format } from "winston";
// Local imports
import { logFormat } from "../../src/logging";
import { name } from "../../src/info/general";
// Type imports
import type { Logger } from "winston";

export const getTestLogger = (testName: string): Logger =>
  winston.createLogger({
    defaultMeta: {
      service: `${name}_Test_${testName}`,
    },
    format: format.combine(format.timestamp(), format.printf(logFormat)),
    level: "warn",
    transports: [new winston.transports.Console()],
  });
