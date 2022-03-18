// Package imports
import path from "path";
import chai from "chai";
import { describe } from "mocha";
// Local imports
import * as database from "../../../../src/database/core";
import { getTestLogger } from "../../logger";
import { itAllowFail } from "../../allowFail";

const githubCiMaxTimeout = 8000;

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("management", () => {
    const logger = getTestLogger("Management");

    itAllowFail("remove", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "remove.db");
      await database.remove(databasePath, logger);
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists = await database.exists(databasePath, logger);
      chai.expect(exists).to.equal(false, "Database does not exist");
    });
    itAllowFail("create", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "create.db");
      await database.remove(databasePath, logger);
      const db = await database.create(databasePath, logger);
      chai.expect(db).to.not.equal(undefined, "Database not undefined");
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists = await database.exists(databasePath, logger);
      chai.expect(exists).to.equal(true, "Database exists");
      const db2 = await database.create(databasePath, logger);
      chai.expect(db2).to.not.equal(undefined, "Database not undefined");
    });
    itAllowFail("open", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "open.db");

      await database.remove(databasePath, logger);
      await database.create(databasePath, logger);
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const dbReadWrite = await database.open(databasePath, logger);
      chai
        .expect(dbReadWrite)
        .to.not.equal(undefined, "Database not undefined");

      await database.remove(databasePath, logger);
      await database.create(databasePath, logger);
      // The warning makes literally no sense
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const dbReadOnly = await database.open(databasePath, logger, {
        readOnly: true,
      });
      chai.expect(dbReadOnly).to.not.equal(undefined, "Database not undefined");

      await database.remove(databasePath, logger);
      let throwsException1 = false;
      try {
        // The warning makes literally no sense
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await database.open(databasePath, logger);
      } catch (error) {
        throwsException1 = true;
        chai
          .expect((error as database.SqliteInternalError).code)
          .to.deep.equal(database.ErrorCodeOpen.SQLITE_CANTOPEN);
      }
      chai.expect(throwsException1).to.equal(true);

      await database.remove(databasePath, logger);
      let throwsException2 = false;
      try {
        // The warning makes literally no sense
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await database.open(databasePath, logger, { readOnly: true });
      } catch (error) {
        throwsException2 = true;
        chai
          .expect((error as database.SqliteInternalError).code)
          .to.deep.equal(database.ErrorCodeOpen.SQLITE_CANTOPEN);
      }
      chai.expect(throwsException2).to.equal(true);
    }).timeout(githubCiMaxTimeout);
  });
};
