/* eslint-disable no-magic-numbers */

// Package imports
import chai from "chai";
import { describe } from "mocha";
import path from "path";
// Local imports
import {
  CreateError,
  GeneralError,
} from "../../../../src/database/moonpie/requests";
import { createAndSetupTables } from "../../../../src/database/moonpie/management";
import { getTestLogger } from "../../logger";
import { itAllowFail } from "../../allowFail";
import { moonpieDb } from "../../../../src/database/moonpieDb";

const githubCiMaxTimeout = 8000;

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("requests", () => {
    const logger = getTestLogger("Requests");

    itAllowFail("create", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_create.db");
      await createAndSetupTables(databasePath, logger);

      const id1 = await moonpieDb.create(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );
      chai.expect(id1).to.be.a("number");

      const id2 = await moonpieDb.create(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );
      chai.expect(id2).to.be.a("number");

      try {
        await moonpieDb.create(
          databasePath,
          {
            id: "3",
            name: "four",
          },
          logger
        );
        chai.expect(false);
      } catch (err) {
        chai
          .expect((err as Error).message)
          .to.equal(CreateError.ALREADY_EXISTS);
      }
    }).timeout(githubCiMaxTimeout);
    itAllowFail("exists", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_exists.db");
      await createAndSetupTables(databasePath, logger);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.exists(databasePath, "1", logger);
      chai.expect(notExists1).to.be.equal(false);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists2 = await moonpieDb.exists(databasePath, "3", logger);
      chai.expect(notExists2).to.be.equal(false);

      await moonpieDb.create(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.exists(databasePath, "3", logger);
      chai.expect(exists1).to.be.equal(true);
    }).timeout(githubCiMaxTimeout);
    itAllowFail("existsName", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_existsName.db"
      );
      await createAndSetupTables(databasePath, logger);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.existsName(
        databasePath,
        "one",
        logger
      );
      chai.expect(notExists1).to.be.equal(false);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists2 = await moonpieDb.existsName(
        databasePath,
        "four",
        logger
      );
      chai.expect(notExists2).to.be.equal(false);

      await moonpieDb.create(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.existsName(databasePath, "four", logger);
      chai.expect(exists1).to.be.equal(true);
    }).timeout(githubCiMaxTimeout);
    itAllowFail("getMoonpie", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_getMoonpie.db"
      );
      await createAndSetupTables(databasePath, logger);

      try {
        await moonpieDb.getMoonpie(databasePath, "3", logger);
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }

      await moonpieDb.create(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      const moonpieInfo1 = await moonpieDb.getMoonpie(
        databasePath,
        "3",
        logger
      );
      chai.expect(moonpieInfo1.id).to.be.equal("3");
      chai.expect(moonpieInfo1.name).to.be.equal("four");
      chai.expect(moonpieInfo1.count).to.be.equal(0);
      chai.expect(moonpieInfo1.timestamp).to.be.a("number");

      try {
        await moonpieDb.getMoonpie(databasePath, "7", logger);
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }
    }).timeout(githubCiMaxTimeout);
    itAllowFail("getMoonpieName", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_getMoonpieName.db"
      );
      await createAndSetupTables(databasePath, logger);

      try {
        await moonpieDb.getMoonpieName(databasePath, "four", logger);
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }

      await moonpieDb.create(
        databasePath,
        {
          id: "3",
          name: "four",
        },
        logger
      );

      const moonpieInfo1 = await moonpieDb.getMoonpieName(
        databasePath,
        "four",
        logger
      );
      chai.expect(moonpieInfo1.id).to.be.equal("3");
      chai.expect(moonpieInfo1.name).to.be.equal("four");
      chai.expect(moonpieInfo1.count).to.be.equal(0);
      chai.expect(moonpieInfo1.timestamp).to.be.a("number");

      try {
        await moonpieDb.getMoonpieName(databasePath, "seven", logger);
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }
    }).timeout(githubCiMaxTimeout);
    itAllowFail("update", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_update.db");
      await createAndSetupTables(databasePath, logger);

      try {
        await moonpieDb.update(
          databasePath,
          {
            count: 10,
            id: "3",
            name: "four",
          },
          logger
        );
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }

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
          count: 10,
          id: "3",
          name: "four",
        },
        logger
      );

      const moonpieInfo1 = await moonpieDb.getMoonpie(
        databasePath,
        "3",
        logger
      );
      chai.expect(moonpieInfo1.id).to.be.equal("3");
      chai.expect(moonpieInfo1.name).to.be.equal("four");
      chai.expect(moonpieInfo1.count).to.be.equal(10);
      chai.expect(moonpieInfo1.timestamp).to.be.a("number");

      await moonpieDb.update(
        databasePath,
        {
          count: 11,
          id: "3",
          name: "five",
          timestamp: 111,
        },
        logger
      );

      const moonpieInfo2 = await moonpieDb.getMoonpie(
        databasePath,
        "3",
        logger
      );
      chai.expect(moonpieInfo2.id).to.be.equal("3");
      chai.expect(moonpieInfo2.name).to.be.equal("five");
      chai.expect(moonpieInfo2.count).to.be.equal(11);
      chai.expect(moonpieInfo2.timestamp).to.be.equal(111);
    }).timeout(githubCiMaxTimeout);
    itAllowFail(
      "getMoonpieLeaderboard",
      process.platform === "win32",
      async () => {
        const databasePath = path.join(
          databaseDirPath,
          "moonpieDb_getMoonpieLeaderboard.db"
        );
        await createAndSetupTables(databasePath, logger);

        const leaderboard1 = await moonpieDb.getMoonpieLeaderboard(
          databasePath,
          10,
          0,
          logger
        );
        chai.expect(leaderboard1).to.be.an("array");
        chai.expect(leaderboard1.length).to.be.equal(0);

        await moonpieDb.create(
          databasePath,
          {
            id: "3",
            name: "four",
          },
          logger
        );

        const leaderboard2 = await moonpieDb.getMoonpieLeaderboard(
          databasePath,
          10,
          0,
          logger
        );
        chai.expect(leaderboard2).to.be.an("array");
        chai.expect(leaderboard2.length).to.be.equal(1);
        chai.expect(leaderboard2[0].count).to.be.equal(0);
        chai.expect(leaderboard2[0].name).to.be.equal("four");
        chai.expect(leaderboard2[0].rank).to.be.equal(1);

        await moonpieDb.create(
          databasePath,
          {
            id: "6",
            name: "six",
          },
          logger
        );

        const leaderboard3 = await moonpieDb.getMoonpieLeaderboard(
          databasePath,
          10,
          0,
          logger
        );
        chai.expect(leaderboard3).to.be.an("array");
        chai.expect(leaderboard3.length).to.be.equal(2);
        chai.expect(leaderboard3[0].count).to.be.equal(0);
        chai.expect(leaderboard3[0].name).to.be.equal("four");
        chai.expect(leaderboard3[0].rank).to.be.equal(1);
        chai.expect(leaderboard3[1].count).to.be.equal(0);
        chai.expect(leaderboard3[1].name).to.be.equal("six");
        chai.expect(leaderboard3[1].rank).to.be.equal(2);

        await moonpieDb.create(
          databasePath,
          {
            id: "8",
            name: "eight",
          },
          logger
        );

        await moonpieDb.update(
          databasePath,
          {
            count: 10,
            id: "8",
            name: "eight",
          },
          logger
        );
        await moonpieDb.update(
          databasePath,
          {
            count: 1,
            id: "6",
            name: "six_new_name",
          },
          logger
        );

        const offset = 1;
        const leaderboard4 = await moonpieDb.getMoonpieLeaderboard(
          databasePath,
          10,
          offset + 1,
          logger
        );
        chai.expect(leaderboard4).to.be.an("array");
        chai.expect(leaderboard4.length).to.be.equal(3 - offset);
        chai.expect(leaderboard4[1 - offset].count).to.be.equal(1);
        chai.expect(leaderboard4[1 - offset].name).to.be.equal("six_new_name");
        chai.expect(leaderboard4[1 - offset].rank).to.be.equal(2);
        chai.expect(leaderboard4[2 - offset].count).to.be.equal(0);
        chai.expect(leaderboard4[2 - offset].name).to.be.equal("four");
        chai.expect(leaderboard4[2 - offset].rank).to.be.equal(3);
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
        await createAndSetupTables(databasePath, logger);

        try {
          await moonpieDb.getMoonpieLeaderboardEntry(databasePath, "1", logger);
          chai.expect(false);
        } catch (err) {
          chai
            .expect((err as Error).message)
            .to.equal(GeneralError.NOT_EXISTING);
        }

        await moonpieDb.create(
          databasePath,
          {
            id: "1",
            name: "one",
          },
          logger
        );

        const leaderboard1 = await moonpieDb.getMoonpieLeaderboardEntry(
          databasePath,
          "1",
          logger
        );
        chai.expect(leaderboard1.count).to.be.equal(0);
        chai.expect(leaderboard1.name).to.be.equal("one");
        chai.expect(leaderboard1.rank).to.be.equal(1);

        await moonpieDb.create(
          databasePath,
          {
            id: "4",
            name: "four",
          },
          logger
        );
        await moonpieDb.update(
          databasePath,
          {
            count: 5,
            id: "4",
            name: "four",
          },
          logger
        );

        const leaderboard2 = await moonpieDb.getMoonpieLeaderboardEntry(
          databasePath,
          "1",
          logger
        );
        chai.expect(leaderboard2.count).to.be.equal(0);
        chai.expect(leaderboard2.name).to.be.equal("one");
        chai.expect(leaderboard2.rank).to.be.equal(2);

        await moonpieDb.update(
          databasePath,
          {
            count: 10,
            id: "1",
            name: "one",
          },
          logger
        );

        const leaderboard3 = await moonpieDb.getMoonpieLeaderboardEntry(
          databasePath,
          "1",
          logger
        );
        chai.expect(leaderboard3.count).to.be.equal(10);
        chai.expect(leaderboard3.name).to.be.equal("one");
        chai.expect(leaderboard3.rank).to.be.equal(1);
      }
    ).timeout(githubCiMaxTimeout);
    itAllowFail("remove", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_remove.db");
      await createAndSetupTables(databasePath, logger);

      try {
        await moonpieDb.remove(databasePath, "1", logger);
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }

      await moonpieDb.create(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.exists(databasePath, "1", logger);
      chai.expect(exists1).to.be.equal(true);

      const remove1 = await moonpieDb.remove(databasePath, "1", logger);
      chai.expect(remove1).to.be.equal(true);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.exists(databasePath, "1", logger);
      chai.expect(notExists1).to.be.equal(false);
    }).timeout(githubCiMaxTimeout);
    itAllowFail("removeName", process.platform === "win32", async () => {
      const databasePath = path.join(
        databaseDirPath,
        "moonpieDb_removeName.db"
      );
      await createAndSetupTables(databasePath, logger);

      try {
        await moonpieDb.removeName(databasePath, "one", logger);
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal(GeneralError.NOT_EXISTING);
      }

      await moonpieDb.create(
        databasePath,
        {
          id: "1",
          name: "one",
        },
        logger
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const exists1 = await moonpieDb.existsName(databasePath, "one", logger);
      chai.expect(exists1).to.be.equal(true);

      const remove1 = await moonpieDb.removeName(databasePath, "one", logger);
      chai.expect(remove1).to.be.equal(true);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const notExists1 = await moonpieDb.existsName(
        databasePath,
        "one",
        logger
      );
      chai.expect(notExists1).to.be.equal(false);
    }).timeout(githubCiMaxTimeout);
  });
};
