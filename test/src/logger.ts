// Package imports
import winston, { format } from "winston";
// Local imports
import { logFormat } from "../../src/logging";
import { name } from "../../src/info/general";

export const getTestLogger = (testName: string) =>
  winston.createLogger({
    level: "warn",
    transports: [new winston.transports.Console()],
    format: format.combine(format.timestamp(), format.printf(logFormat)),
    defaultMeta: {
      service: `${name}_Test_${testName}`,
    },
  });
