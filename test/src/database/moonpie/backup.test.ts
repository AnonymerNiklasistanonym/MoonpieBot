/* eslint-disable no-magic-numbers */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
import path from "path";
// Local imports
import { getTestLogger } from "../../logger";
import { itAllowFail } from "../../allowFail";
import moonpieDb from "../../../../src/database/moonpieDb";
import { MoonpieDbError } from "../../../../src/info/databases/moonpieDb";
// Type imports
import type { Suite } from "mocha";

const githubCiMaxTimeout = 8000;

export default (databaseDirPath: string): Suite => {
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
      expect(backup1).to.be.an("array");
      expect(backup1.length).to.be.equal(0);

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
      expect(backup2).to.be.an("array");
      expect(backup2.length).to.be.equal(2);
      const id1 = backup2.find((a) => a.id === "1");
      const id2 = backup2.find((a) => a.id === "3");
      expect(id1).to.be.not.undefined;
      expect(id2).to.be.not.undefined;
      if (id1) {
        expect(id1.name).to.be.equal("one");
        expect(id1.count).to.be.equal(0);
        expect(id1.timestamp).to.be.a("number");
      }
      if (id2) {
        expect(id2.name).to.be.equal("four");
        expect(id2.count).to.be.equal(20);
        expect(id2.timestamp).to.be.equal(42);
      }

      try {
        await moonpieDb.backup.exportMoonpieCountTableToJson(
          databasePath + "abc",
          logger
        );
        expect(false);
      } catch (err) {
        chai
          .expect((err as Error).message)
          .to.equal(MoonpieDbError.NOT_EXISTING);
      }
    }).timeout(githubCiMaxTimeout);
  });
};
