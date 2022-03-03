import { moonpieDb, moonpieDbBackup } from "../../../../src/database/moonpieDb";
import chai from "chai";
import { describe } from "mocha";
import { getTestLogger } from "../../logger";
import { itAllowFail } from "../../allowFail";
import path from "path";
import { createAndSetupTables } from "../../../../src/database/moonpie/management";
import { GeneralError } from "../../../../src/database/moonpie/requests";

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("backup", () => {
    const logger = getTestLogger("Backup");

    itAllowFail("backupTables", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_backupTables.db"
      );
      await createAndSetupTables(databasePath, logger);

      const backup1 = await moonpieDbBackup.exportMoonpieCountTableToJson(
        databasePath,
        logger
      );
      chai.expect(backup1).to.be.an("array");
      chai.expect(backup1.length).to.be.equal(0);

      await moonpieDb.create(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );

      await moonpieDb.create(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      await moonpieDb.update(
        databasePath,
        {
          id: "3",
          name: "four",
          count: 20,
          timestamp: 42,
        },
        logger
      );

      const backup2 = await moonpieDbBackup.exportMoonpieCountTableToJson(
        databasePath,
        logger
      );
      chai.expect(backup2).to.be.an("array");
      chai.expect(backup2.length).to.be.equal(2);
      const id1 = backup2.find((a) => a.id === "1");
      const id2 = backup2.find((a) => a.id === "3");
      chai.expect(id1).to.be.not.undefined;
      chai.expect(id2).to.be.not.undefined;
      if (id1) {
        chai.expect(id1.name).to.be.equal("one");
        chai.expect(id1.count).to.be.equal(0);
        chai.expect(id1.timestamp).to.be.a("number");
      }
      if (id2) {
        chai.expect(id2.name).to.be.equal("four");
        chai.expect(id2.count).to.be.equal(20);
        chai.expect(id2.timestamp).to.be.equal(42);
      }

      try {
        await moonpieDbBackup.exportMoonpieCountTableToJson(
          databasePath + "abc",
          logger
        );
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }
    }).timeout(2000);
  });
};
