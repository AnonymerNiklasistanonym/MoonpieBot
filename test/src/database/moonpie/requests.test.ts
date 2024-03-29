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
  return describe("requests", () => {
    const logger = getTestLogger("Requests");

    itAllowFail("create", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_create.db");
      await moonpieDb.setup(databasePath, logger);

      const id1 = await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );
      expect(id1).to.be.a("number");

      const id2 = await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );
      expect(id2).to.be.a("number");

      try {
        await moonpieDb.requests.moonpie.createEntry(
          databasePath,
          {
            id: "3",
            name: "four",
          },
          logger
        );
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.ALREADY_EXISTS);
      }
    }).timeout(githubCiMaxTimeout);
    itAllowFail("exists", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_exists.db");
      await moonpieDb.setup(databasePath, logger);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.requests.moonpie.existsEntry(
        databasePath,
        "1",
        logger
      );
      expect(notExists1).to.be.equal(false);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists2 = await moonpieDb.requests.moonpie.existsEntry(
        databasePath,
        "3",
        logger
      );
      expect(notExists2).to.be.equal(false);

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.requests.moonpie.existsEntry(
        databasePath,
        "3",
        logger
      );
      expect(exists1).to.be.equal(true);
    }).timeout(githubCiMaxTimeout);
    itAllowFail("existsName", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_existsName.db"
      );
      await moonpieDb.setup(databasePath, logger);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.requests.moonpie.existsEntryName(
        databasePath,
        "one",
        logger
      );
      expect(notExists1).to.be.equal(false);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists2 = await moonpieDb.requests.moonpie.existsEntryName(
        databasePath,
        "four",
        logger
      );
      expect(notExists2).to.be.equal(false);

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.requests.moonpie.existsEntryName(
        databasePath,
        "four",
        logger
      );
      expect(exists1).to.be.equal(true);
    }).timeout(githubCiMaxTimeout);
    itAllowFail("getMoonpie", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_getMoonpie.db"
      );
      await moonpieDb.setup(databasePath, logger);

      try {
        await moonpieDb.requests.moonpie.getEntry(databasePath, "3", logger);
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
      }

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      const moonpieInfo1 = await moonpieDb.requests.moonpie.getEntry(
        databasePath,
        "3",
        logger
      );
      expect(moonpieInfo1.id).to.be.equal("3");
      expect(moonpieInfo1.name).to.be.equal("four");
      expect(moonpieInfo1.count).to.be.equal(0);
      expect(moonpieInfo1.timestamp).to.be.a("number");

      try {
        await moonpieDb.requests.moonpie.getEntry(databasePath, "7", logger);
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
      }
    }).timeout(githubCiMaxTimeout);
    itAllowFail("getMoonpieName", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_getMoonpieName.db"
      );
      await moonpieDb.setup(databasePath, logger);

      try {
        await moonpieDb.requests.moonpie.getEntryName(
          databasePath,
          "four",
          logger
        );
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
      }

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      const moonpieInfo1 = await moonpieDb.requests.moonpie.getEntryName(
        databasePath,
        "four",
        logger
      );
      expect(moonpieInfo1.id).to.be.equal("3");
      expect(moonpieInfo1.name).to.be.equal("four");
      expect(moonpieInfo1.count).to.be.equal(0);
      expect(moonpieInfo1.timestamp).to.be.a("number");

      try {
        await moonpieDb.requests.moonpie.getEntryName(
          databasePath,
          "seven",
          logger
        );
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
      }
    }).timeout(githubCiMaxTimeout);
    itAllowFail("update", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_update.db");
      await moonpieDb.setup(databasePath, logger);

      try {
        await moonpieDb.requests.moonpie.updateEntry(
          databasePath,
          {
            count: 10,
            id: "3",
            name: "four",
          },
          logger
        );
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
      }

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
          count: 10,
          id: "3",
          name: "four",
        },
        logger
      );

      const moonpieInfo1 = await moonpieDb.requests.moonpie.getEntry(
        databasePath,
        "3",
        logger
      );
      expect(moonpieInfo1.id).to.be.equal("3");
      expect(moonpieInfo1.name).to.be.equal("four");
      expect(moonpieInfo1.count).to.be.equal(10);
      expect(moonpieInfo1.timestamp).to.be.a("number");

      await moonpieDb.requests.moonpie.updateEntry(
        databasePath,
        {
          count: 11,
          id: "3",
          name: "five",
          timestamp: 111,
        },
        logger
      );

      const moonpieInfo2 = await moonpieDb.requests.moonpie.getEntry(
        databasePath,
        "3",
        logger
      );
      expect(moonpieInfo2.id).to.be.equal("3");
      expect(moonpieInfo2.name).to.be.equal("five");
      expect(moonpieInfo2.count).to.be.equal(11);
      expect(moonpieInfo2.timestamp).to.be.equal(111);
    }).timeout(githubCiMaxTimeout);
    itAllowFail(
      "getMoonpieLeaderboard",
      process.platform === "win32",
      async () => {
        const databasePath = path.join(
          databaseDirPath,
          "moonpieDb_getMoonpieLeaderboard.db"
        );
        await moonpieDb.setup(databasePath, logger);

        const leaderboard1 =
          await moonpieDb.requests.moonpieLeaderboard.getEntries(
            databasePath,
            10,
            0,
            logger
          );
        expect(leaderboard1).to.be.an("array");
        expect(leaderboard1.length).to.be.equal(0);

        await moonpieDb.requests.moonpie.createEntry(
          databasePath,
          {
            id: "3",
            name: "four",
          },
          logger
        );

        const leaderboard2 =
          await moonpieDb.requests.moonpieLeaderboard.getEntries(
            databasePath,
            10,
            0,
            logger
          );
        expect(leaderboard2).to.be.an("array");
        expect(leaderboard2.length).to.be.equal(1);
        expect(leaderboard2[0].count).to.be.equal(0);
        expect(leaderboard2[0].name).to.be.equal("four");
        expect(leaderboard2[0].rank).to.be.equal(1);

        await moonpieDb.requests.moonpie.createEntry(
          databasePath,
          {
            id: "6",
            name: "six",
          },
          logger
        );

        const leaderboard3 =
          await moonpieDb.requests.moonpieLeaderboard.getEntries(
            databasePath,
            10,
            0,
            logger
          );
        expect(leaderboard3).to.be.an("array");
        expect(leaderboard3.length).to.be.equal(2);
        expect(leaderboard3[0].count).to.be.equal(0);
        expect(leaderboard3[0].name).to.be.equal("four");
        expect(leaderboard3[0].rank).to.be.equal(1);
        expect(leaderboard3[1].count).to.be.equal(0);
        expect(leaderboard3[1].name).to.be.equal("six");
        expect(leaderboard3[1].rank).to.be.equal(2);

        await moonpieDb.requests.moonpie.createEntry(
          databasePath,
          {
            id: "8",
            name: "eight",
          },
          logger
        );

        await moonpieDb.requests.moonpie.updateEntry(
          databasePath,
          {
            count: 10,
            id: "8",
            name: "eight",
          },
          logger
        );
        await moonpieDb.requests.moonpie.updateEntry(
          databasePath,
          {
            count: 1,
            id: "6",
            name: "six_new_name",
          },
          logger
        );

        const offset = 1;
        const leaderboard4 =
          await moonpieDb.requests.moonpieLeaderboard.getEntries(
            databasePath,
            10,
            offset + 1,
            logger
          );
        expect(leaderboard4).to.be.an("array");
        expect(leaderboard4.length).to.be.equal(3 - offset);
        expect(leaderboard4[1 - offset].count).to.be.equal(1);
        expect(leaderboard4[1 - offset].name).to.be.equal("six_new_name");
        expect(leaderboard4[1 - offset].rank).to.be.equal(2);
        expect(leaderboard4[2 - offset].count).to.be.equal(0);
        expect(leaderboard4[2 - offset].name).to.be.equal("four");
        expect(leaderboard4[2 - offset].rank).to.be.equal(3);
      }
    ).timeout(githubCiMaxTimeout);
    itAllowFail(
      "getMoonpieLeaderboardEntry",
      process.platform === "win32",
      async () => {
        const databasePath = path.join(
          databaseDirPath,
          "moonpieDb_getMoonpieLeaderboardEntry.db"
        );
        await moonpieDb.setup(databasePath, logger);

        try {
          await moonpieDb.requests.moonpieLeaderboard.getEntry(
            databasePath,
            "1",
            logger
          );
          expect(false);
        } catch (err) {
          expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
        }

        await moonpieDb.requests.moonpie.createEntry(
          databasePath,
          {
            id: "1",
            name: "one",
          },
          logger
        );

        const leaderboard1 =
          await moonpieDb.requests.moonpieLeaderboard.getEntry(
            databasePath,
            "1",
            logger
          );
        expect(leaderboard1.count).to.be.equal(0);
        expect(leaderboard1.name).to.be.equal("one");
        expect(leaderboard1.rank).to.be.equal(1);

        await moonpieDb.requests.moonpie.createEntry(
          databasePath,
          {
            id: "4",
            name: "four",
          },
          logger
        );
        await moonpieDb.requests.moonpie.updateEntry(
          databasePath,
          {
            count: 5,
            id: "4",
            name: "four",
          },
          logger
        );

        const leaderboard2 =
          await moonpieDb.requests.moonpieLeaderboard.getEntry(
            databasePath,
            "1",
            logger
          );
        expect(leaderboard2.count).to.be.equal(0);
        expect(leaderboard2.name).to.be.equal("one");
        expect(leaderboard2.rank).to.be.equal(2);

        await moonpieDb.requests.moonpie.updateEntry(
          databasePath,
          {
            count: 10,
            id: "1",
            name: "one",
          },
          logger
        );

        const leaderboard3 =
          await moonpieDb.requests.moonpieLeaderboard.getEntry(
            databasePath,
            "1",
            logger
          );
        expect(leaderboard3.count).to.be.equal(10);
        expect(leaderboard3.name).to.be.equal("one");
        expect(leaderboard3.rank).to.be.equal(1);
      }
    ).timeout(githubCiMaxTimeout);
    itAllowFail("remove", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_remove.db");
      await moonpieDb.setup(databasePath, logger);

      try {
        await moonpieDb.requests.moonpie.removeEntry(databasePath, "1", logger);
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
      }

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.requests.moonpie.existsEntry(
        databasePath,
        "1",
        logger
      );
      expect(exists1).to.be.equal(true);

      const remove1 = await moonpieDb.requests.moonpie.removeEntry(
        databasePath,
        "1",
        logger
      );
      expect(remove1).to.be.equal(true);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.requests.moonpie.existsEntry(
        databasePath,
        "1",
        logger
      );
      expect(notExists1).to.be.equal(false);
    }).timeout(githubCiMaxTimeout);
    itAllowFail("removeName", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_removeName.db"
      );
      await moonpieDb.setup(databasePath, logger);

      try {
        await moonpieDb.requests.moonpie.removeEntryName(
          databasePath,
          "one",
          logger
        );
        expect(false);
      } catch (err) {
        expect((err as Error).message).to.equal(MoonpieDbError.NOT_EXISTING);
      }

      await moonpieDb.requests.moonpie.createEntry(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.requests.moonpie.existsEntryName(
        databasePath,
        "one",
        logger
      );
      expect(exists1).to.be.equal(true);

      const remove1 = await moonpieDb.requests.moonpie.removeEntryName(
        databasePath,
        "one",
        logger
      );
      expect(remove1).to.be.equal(true);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.requests.moonpie.existsEntryName(
        databasePath,
        "one",
        logger
      );
      expect(notExists1).to.be.equal(false);
    }).timeout(githubCiMaxTimeout);
  });
};
