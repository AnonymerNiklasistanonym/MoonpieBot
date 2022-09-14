/* eslint-disable no-magic-numbers */

// Package imports
import chai from "chai";
import { describe } from "mocha";
import path from "path";
// Local imports
import { getTestLogger } from "../../logger";
import { itAllowFail } from "../../allowFail";
import moonpieDb from "../../../../src/database/moonpieDb";
import { MoonpieDbError } from "../../../../src/database/moonpieDb/info";

const githubCiMaxTimeout = 8000;

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("backup", () => {
    const logger = getTestLogger("Backup");

    itAllowFail("backupTables", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_backupTables.db"
      );
      await moonpieDb.setup(databasePath, logger);

      const backup1 = await moonpieDb.backup.exportMoonpieCountTableToJson(
        databasePath,
        logger
      );
      chai.expect(backup1).to.be.an("array");
      chai.expect(backup1.length).to.be.equal(0);

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      await moonpieDb.requests.moonpie.updateEntry(
        databasePath,
        {
          count: 20,
          id: "3",
          name: "four",
          timestamp: 42,
        },
        logger
      );

      const backup2 = await moonpieDb.backup.exportMoonpieCountTableToJson(
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
        await moonpieDb.backup.exportMoonpieCountTableToJson(
          databasePath + "abc",
          logger
        );
        chai.expect(false);
      } catch (err) {
        chai
          .expect((err as Error).message)
          .to.equal(MoonpieDbError.NOT_EXISTING);
      }
    }).timeout(githubCiMaxTimeout);
  });
};
