// Package imports
import { describe } from "mocha";
import { expect } from "chai";
import os from "os";
import path from "path";
// Local imports
import { createLogger, LoggerLevel } from "../../src/logging";

describe("logging", () => {
  it("createLogger", () => {
    const loggerDirPath = path.join(os.tmpdir(), "moonpiebot", "logs");

    const loggerDirPath1 = path.join(loggerDirPath, "1");
    const logger1 = createLogger("a", loggerDirPath1);
    expect(logger1).to.not.be.undefined;
    logger1.info("Info");

    const loggerDirPath2 = path.join(loggerDirPath, "2");
    const logger2 = createLogger(
      "b",
      loggerDirPath2,
      LoggerLevel.WARN,
      LoggerLevel.WARN
    );
    expect(logger2).to.not.be.undefined;
    logger2.info("Info");

    const loggerDirPath3 = path.join(loggerDirPath, "3");
    const logger3 = createLogger(
      "c",
      loggerDirPath3,
      LoggerLevel.WARN,
      LoggerLevel.WARN
    );
    expect(logger3).to.not.be.undefined;
    logger3.info("Info");

    const loggerDirPath4 = path.join(loggerDirPath, "3");
    const logger4 = createLogger(
      "d",
      loggerDirPath4,
      LoggerLevel.WARN,
      LoggerLevel.WARN
    );
    expect(logger4).to.not.be.undefined;
    logger4.log({
      level: "error",
      message: "Message: Error",
      section: "command",
      subsection: "subsection",
    });
    logger4.log({
      level: "error",
      message: "Message: Error",
      section: "command",
    });
  });
});
