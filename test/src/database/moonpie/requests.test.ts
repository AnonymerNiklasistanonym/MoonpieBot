import { moonpieDb } from "../../../../src/database/moonpieDb";
import chai from "chai";
import { describe } from "mocha";
import { getTestLogger } from "../../logger";
import { itAllowFail } from "../../allowFail";
import path from "path";
import { createAndSetupTables } from "../../../../src/database/moonpie/management";

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("moonpieDb", () => {
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
    });
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
    });
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
    });
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
        chai.expect((err as Error).message).to.equal("MOONPIE_NOT_EXISTING");
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
    });
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
        chai.expect((err as Error).message).to.equal("MOONPIE_NOT_EXISTING");
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
    });
    itAllowFail("update", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "moonpieDb_update.db");
      await createAndSetupTables(databasePath, logger);

      try {
        await moonpieDb.update(
          databasePath,
          {
            id: "3",
            name: "four",
            count: 10,
          },
          logger
        );
        chai.expect(false);
      } catch (err) {
        chai.expect((err as Error).message).to.equal("MOONPIE_NOT_EXISTING");
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
          id: "3",
          name: "four",
          count: 10,
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
    });
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
            id: "8",
            name: "eight",
            count: 10,
          },
          logger
        );
        await moonpieDb.update(
          databasePath,
          {
            id: "6",
            name: "six_new_name",
            count: 1,
          },
          logger
        );

        const leaderboard4 = await moonpieDb.getMoonpieLeaderboard(
          databasePath,
          10,
          logger
        );
        chai.expect(leaderboard4).to.be.an("array");
        chai.expect(leaderboard4.length).to.be.equal(3);
        chai.expect(leaderboard4[0].count).to.be.equal(10);
        chai.expect(leaderboard4[0].name).to.be.equal("eight");
        chai.expect(leaderboard4[0].rank).to.be.equal(1);
        chai.expect(leaderboard4[1].count).to.be.equal(1);
        chai.expect(leaderboard4[1].name).to.be.equal("six_new_name");
        chai.expect(leaderboard4[1].rank).to.be.equal(2);
        chai.expect(leaderboard4[2].count).to.be.equal(0);
        chai.expect(leaderboard4[2].name).to.be.equal("four");
        chai.expect(leaderboard4[2].rank).to.be.equal(3);
      }
    );
  });
};
