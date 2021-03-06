import * as database from "../../../../src/database/core";
import chai from "chai";
import { describe } from "mocha";
import { getTestLogger } from "../../logger";
import { itAllowFail } from "../../allowFail";
import path from "path";

const githubCiMaxTimeout = 8000;

export default (databaseDirPath: string): Mocha.Suite => {
  return describe("requests", () => {
    const logger = getTestLogger("Requests");

    const tableName = "test";
    const tableColumns: database.queries.CreateTableColumn[] = [
      {
        name: "blob",
        type: database.queries.CreateTableColumnType.BLOB,
      },
      {
        name: "integer",
        type: database.queries.CreateTableColumnType.INTEGER,
      },
      {
        name: "numeric",
        type: database.queries.CreateTableColumnType.NUMERIC,
      },
      {
        name: "real",
        type: database.queries.CreateTableColumnType.REAL,
      },
      {
        name: "text",
        type: database.queries.CreateTableColumnType.TEXT,
      },
      {
        name: "unique_text_and_not_null",
        options: { notNull: true, unique: true },
        type: database.queries.CreateTableColumnType.TEXT,
      },
    ];
    interface DbAllColumnsOutput {
      blob: string;
      integer: number;
      numeric: number;
      real: number;
      text: string;
      // eslint-disable-next-line camelcase
      unique_text_and_not_null: string;
    }
    interface DbLastColumnOutput {
      // eslint-disable-next-line camelcase
      unique_text_and_not_null: string;
    }
    itAllowFail("post", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "post.db");
      await database.remove(databasePath, logger);
      await database.create(databasePath, logger);

      const queryCreateTable = database.queries.createTable(
        tableName,
        tableColumns
      );
      const postResultCreateTable = await database.requests.post(
        databasePath,
        queryCreateTable,
        undefined,
        logger
      );
      chai.expect(postResultCreateTable.changes).to.be.a("number");
      chai.expect(postResultCreateTable.lastID).to.be.a("number");

      const queryInsert = database.queries.insert(
        tableName,
        tableColumns.map((a) => a.name)
      );
      const postResultInsert1 = await database.requests.post(
        databasePath,
        queryInsert,
        ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
        logger
      );
      chai.expect(postResultInsert1.changes).to.equal(1);
      chai.expect(postResultInsert1.lastID).to.be.a("number");
      const postResultInsert2 = await database.requests.post(
        databasePath,
        queryInsert,
        ["blobData", 1234, 12, 22.3456, "textData", "unique2"],
        logger
      );
      chai.expect(postResultInsert2.changes).to.equal(1);
      chai.expect(postResultInsert2.lastID).to.be.a("number");
      chai
        .expect(postResultInsert2.lastID)
        .to.not.equal(postResultInsert1.lastID, "Inserted row ids differ");

      let throwsException1 = false;
      try {
        await database.requests.post(
          databasePath,
          queryInsert,
          ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
          logger
        );
      } catch (error) {
        throwsException1 = true;
        chai
          .expect(database.requests.isDatabaseError(error))
          .to.equal(true, JSON.stringify(error));
        chai
          .expect((error as database.SqliteInternalError).code)
          .to.equal(database.requests.ErrorCodePostRequest.SQLITE_CONSTRAINT);
      }
      chai.expect(throwsException1).to.equal(true);

      let throwsException2 = false;
      try {
        await database.requests.post(
          databasePath,
          queryInsert,
          ["blobData", 1234, 12, 22.3456, "textData"],
          logger
        );
      } catch (error) {
        throwsException2 = true;
        chai
          .expect(database.requests.isDatabaseError(error))
          .to.equal(true, JSON.stringify(error));
        chai
          .expect((error as database.SqliteInternalError).code)
          .to.equal(database.requests.ErrorCodePostRequest.SQLITE_CONSTRAINT);
      }
      chai.expect(throwsException2).to.equal(true);
    }).timeout(githubCiMaxTimeout);
    itAllowFail("get each", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "getEach.db");
      await database.remove(databasePath, logger);
      await database.create(databasePath, logger);

      await database.requests.post(
        databasePath,
        database.queries.createTable(tableName, tableColumns),
        undefined,
        logger
      );

      const querySelectAllColumns = database.queries.select(
        tableName,
        tableColumns.map((a) => a.name),
        { whereColumn: "integer" }
      );
      const querySelectLastColumn = database.queries.select(
        tableName,
        [tableColumns.map((a) => a.name).slice(-1)[0]],
        { whereColumn: "integer" }
      );

      const getResultSelectAllColumns1 = await database.requests.getEach(
        databasePath,
        querySelectAllColumns,
        [42],
        logger
      );
      chai
        .expect(getResultSelectAllColumns1)
        .to.equal(undefined, "No table entry to select");
      const getResultSelectLastColumn1 = await database.requests.getEach(
        databasePath,
        querySelectLastColumn,
        [42],
        logger
      );
      chai
        .expect(getResultSelectLastColumn1)
        .to.equal(undefined, "No table entry to select");

      const queryInsert = database.queries.insert(
        tableName,
        tableColumns.map((a) => a.name)
      );
      await database.requests.post(
        databasePath,
        queryInsert,
        ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
        logger
      );

      const getResultSelectAllColumns2 = await database.requests.getEach(
        databasePath,
        querySelectAllColumns,
        [42],
        logger
      );
      chai
        .expect(getResultSelectAllColumns2)
        .to.equal(undefined, "No matching table entry to select");
      const getResultSelectLastColumn2 = await database.requests.getEach(
        databasePath,
        querySelectLastColumn,
        [42],
        logger
      );
      chai
        .expect(getResultSelectLastColumn2)
        .to.equal(undefined, "No matching table entry to select");

      const getResultSelectAllColumns3 =
        await database.requests.getEach<DbAllColumnsOutput>(
          databasePath,
          querySelectAllColumns,
          [1234],
          logger
        );
      if (getResultSelectAllColumns3) {
        chai.expect(getResultSelectAllColumns3).to.not.equal(undefined);
        chai.expect(getResultSelectAllColumns3.blob).to.equal("blobData");
        chai.expect(getResultSelectAllColumns3.integer).to.equal(1234);
        chai.expect(getResultSelectAllColumns3.numeric).to.equal(12);
        chai.expect(getResultSelectAllColumns3.real).to.equal(22.3456);
        chai.expect(getResultSelectAllColumns3.text).to.equal("textData");
        chai
          .expect(getResultSelectAllColumns3.unique_text_and_not_null)
          .to.equal("unique1");
      } else {
        chai.assert(false);
      }
      const getResultSelectLastColumn3 =
        await database.requests.getEach<DbLastColumnOutput>(
          databasePath,
          querySelectLastColumn,
          [1234],
          logger
        );
      if (getResultSelectLastColumn3) {
        chai.expect(getResultSelectLastColumn3).to.not.equal(undefined);
        chai
          .expect(getResultSelectLastColumn3.unique_text_and_not_null)
          .to.equal("unique1");
      } else {
        chai.assert(false);
      }
    }).timeout(githubCiMaxTimeout);
    itAllowFail("get all", process.platform === "win32", async () => {
      const databasePath = path.join(databaseDirPath, "getAll.db");
      await database.remove(databasePath, logger);
      await database.create(databasePath, logger);

      await database.requests.post(
        databasePath,
        database.queries.createTable(tableName, tableColumns),
        undefined,
        logger
      );

      const querySelectAllColumns = database.queries.select(
        tableName,
        tableColumns.map((a) => a.name),
        { whereColumn: "integer" }
      );
      const querySelectLastColumn = database.queries.select(
        tableName,
        [tableColumns.map((a) => a.name).slice(-1)[0]],
        { whereColumn: "integer" }
      );

      const getResultSelectAllColumns1 = await database.requests.getAll(
        databasePath,
        querySelectAllColumns,
        [42],
        logger
      );
      chai
        .expect(getResultSelectAllColumns1)
        .to.deep.equal([], "No table entries to select");
      const getResultSelectLastColumn1 = await database.requests.getAll(
        databasePath,
        querySelectLastColumn,
        [42],
        logger
      );
      chai
        .expect(getResultSelectLastColumn1)
        .to.deep.equal([], "No table entries to select");

      const queryInsert = database.queries.insert(
        tableName,
        tableColumns.map((a) => a.name)
      );
      await database.requests.post(
        databasePath,
        queryInsert,
        ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
        logger
      );

      const getResultSelectAllColumns2 = await database.requests.getAll(
        databasePath,
        querySelectAllColumns,
        [42],
        logger
      );
      chai
        .expect(getResultSelectAllColumns2)
        .to.deep.equal([], "No matching table entries to select");
      const getResultSelectLastColumn2 = await database.requests.getAll(
        databasePath,
        querySelectLastColumn,
        [42],
        logger
      );
      chai
        .expect(getResultSelectLastColumn2)
        .to.deep.equal([], "No matching table entries to select");

      const getResultSelectAllColumns3 =
        await database.requests.getAll<DbAllColumnsOutput>(
          databasePath,
          querySelectAllColumns,
          [1234],
          logger
        );
      chai.expect(getResultSelectAllColumns3.length).to.equal(1);
      chai.expect(getResultSelectAllColumns3[0].blob).to.equal("blobData");
      chai.expect(getResultSelectAllColumns3[0].integer).to.equal(1234);
      chai.expect(getResultSelectAllColumns3[0].numeric).to.equal(12);
      chai.expect(getResultSelectAllColumns3[0].real).to.equal(22.3456);
      chai.expect(getResultSelectAllColumns3[0].text).to.equal("textData");
      chai
        .expect(getResultSelectAllColumns3[0].unique_text_and_not_null)
        .to.equal("unique1");
      const getResultSelectLastColumn3 =
        await database.requests.getAll<DbLastColumnOutput>(
          databasePath,
          querySelectLastColumn,
          [1234],
          logger
        );
      chai.expect(getResultSelectLastColumn3.length).to.equal(1);
      chai
        .expect(getResultSelectLastColumn3[0].unique_text_and_not_null)
        .to.equal("unique1");
    }).timeout(githubCiMaxTimeout);
  });
};
