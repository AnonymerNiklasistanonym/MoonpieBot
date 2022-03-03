import { createLogger } from "../../src/logging";
import { describe } from "mocha";
import chai from "chai";
import path from "path";
import os from "os";

describe("logging", () => {
  it("createLogger", () => {
    const loggerDirPath = path.join(os.tmpdir(), "moonpiebot", "logs");

    const loggerDirPath1 = path.join(loggerDirPath, "1");
    const logger1 = createLogger(loggerDirPath1);
    chai.expect(logger1).to.not.be.undefined;
    logger1.info("Info");

    const loggerDirPath2 = path.join(loggerDirPath, "2");
    const logger2 = createLogger(loggerDirPath2, "info", "warn");
    chai.expect(logger2).to.not.be.undefined;
    logger2.info("Info");

    const loggerDirPath3 = path.join(loggerDirPath, "3");
    const logger3 = createLogger(loggerDirPath3, "warn", "warn");
    chai.expect(logger3).to.not.be.undefined;
    logger3.info("Info");

    const loggerDirPath4 = path.join(loggerDirPath, "3");
    const logger4 = createLogger(loggerDirPath4, "warn", "warn");
    chai.expect(logger4).to.not.be.undefined;
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
