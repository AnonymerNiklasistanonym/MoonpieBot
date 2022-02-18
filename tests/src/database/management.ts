import * as database from "../../../src/database";
import chai from "chai";
import { describe } from "mocha";
import winston from "winston";

export default (databasePath: string): Mocha.Suite => {
  return describe("management", () => {
    const logger = winston.createLogger({
      level: "debug",
      transports: [new winston.transports.Console()],
    });

    it("remove", async () => {
      await database.remove(databasePath, logger);
      const exists = await database.exists(databasePath, logger);
      chai.expect(exists).to.equal(false, "Database does not exist");
    });
    it("create", async () => {
      await database.remove(databasePath, logger);
      const db = await database.create(databasePath, logger);
      chai.expect(db).to.not.equal(undefined, "Database not undefined");
      const exists = await database.exists(databasePath, logger);
      chai.expect(exists).to.equal(true, "Database exists");
      const db2 = await database.create(databasePath, logger);
      chai.expect(db2).to.not.equal(undefined, "Database not undefined");
    });
    it("open", async () => {
      await database.remove(databasePath, logger);
      await database.create(databasePath, logger);
      const dbReadWrite = await database.open(databasePath, logger);
      chai
        .expect(dbReadWrite)
        .to.not.equal(undefined, "Database not undefined");

      await database.remove(databasePath, logger);
      await database.create(databasePath, logger);
      const dbReadOnly = await database.open(databasePath, logger, {
        readOnly: true,
      });
      chai.expect(dbReadOnly).to.not.equal(undefined, "Database not undefined");

      await database.remove(databasePath, logger);
      let throwsException1 = false;
      try {
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
        await database.open(databasePath, logger, { readOnly: true });
      } catch (error) {
        throwsException2 = true;
        chai
          .expect((error as database.SqliteInternalError).code)
          .to.deep.equal(database.ErrorCodeOpen.SQLITE_CANTOPEN);
      }
      chai.expect(throwsException2).to.equal(true);
    });
  });
};
