/**
 * Create `DELETE` query.
 *
 * @param tableName Sanitized table name.
 * @param whereColumnName Sanitized column on which value a row should be
 * removed.
 * @returns SQLite query.
 * @example ```sql
 * DELETE FROM tableName: string WHERE whereColumn=?;
 * ```
 */
export const remove = (tableName: string, whereColumnName = "id"): string => {
  return `DELETE FROM ${tableName} WHERE ${whereColumnName}=?;`;
};

/**
 * Create `INSERT INTO` query.
 *
 * @param tableName Sanitized table name.
 * @param columnNames Sanitized column names that should be overwritten with
 * new values.
 * @returns SQLite query.
 * @example ```sql
 * INSERT INTO tableName: string(column_0, column_i, column_n) VALUES(?, ?, ?);
 * ```
 */
export const insert = (tableName: string, columnNames: string[]): string => {
  return (
    `INSERT INTO ${tableName}(${columnNames.join(",")}) ` +
    `VALUES(${columnNames.map(() => "?").join(",")});`
  );
};

export interface ExistsDbOut {
  // eslint-disable-next-line camelcase
  exists_value: number;
}

/**
 * Create `EXISTS` query.
 *
 * @param tableName Sanitized table name.
 * @param whereColumnName Sanitized column name which is checked for existing
 * with query value.
 * @returns SQLite query.
 * @example ```sql
 * SELECT EXISTS(SELECT 1 FROM tableName: string WHERE column=? AS exists_value;
 * ```
 */
export const exists = (tableName: string, whereColumnName = "id"): string => {
  return `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${whereColumnName}=?) AS exists_value;`;
};

export interface SelectQueryInnerJoin {
  /**
   * Name of linked table.
   */
  otherTableName: string;
  /**
   * Name of linked column of linked table.
   */
  otherColumn: string;
  /**
   * Name of column that it should be linked to.
   */
  thisColumn: string;
}

/**
 * Order by interface for select queries.
 *
 * @example ```sql
 * ORDER BY
 * column_1 ASC,
 * column_2 DESC;
 * ```
 */
export interface SelectQueryOrderBy {
  /**
   * Name of the column that should be sorted.
   */
  column: string;
  /**
   * True if ascending sort, false if descending.
   */
  ascending: boolean;
}

export interface SelectWhereColumn {
  columnName: string;
  tableName?: string;
}

export interface SelectQueryOptions {
  /**
   * Inner join descriptions.
   */
  innerJoins?: SelectQueryInnerJoin[];
  limit?: number;
  offset?: number;
  /**
   * Describe a specification of which value a row needs to have to be included
   * `WHERE column = ?`.
   */
  whereColumn?: string | SelectWhereColumn;
  /**
   * Describe a complicated where information: overwrites whereColumn if defined.
   */
  whereCustom?: string;
  /**
   * Only get back unique results.
   */
  unique?: boolean;
  /**
   * Additionally order the results by some columns.
   */
  orderBy?: SelectQueryOrderBy[];
}

export interface SelectColumn {
  alias?: string;
  columnName: string;
  tableName?: string;
}

/**
 * Create `SELECT` query.
 *
 * @param tableName Name of the table where values should be inserted.
 * @param columns Name of the columns where values should be inserted.
 * @param options Select options.
 * @returns SQLite query.
 * @example ```sql
 * SELECT column_0, column_i, column_n FROM tableName: string;
 * SELECT column_i FROM tableName: string WHERE whereColumn=?;
 * SELECT column FROM table INNER JOIN otherTable_i ON otherCol_i=thisCol_i;
 * SELECT DISTINCT column_0 FROM tableName: string;
 * SELECT column_0 FROM tableName: string ORDER BY column_0 ASC;
 * ```
 */
export const select = (
  tableName: string,
  columns: (string | SelectColumn)[],
  options?: SelectQueryOptions
): string => {
  let innerJoinsStr = "";
  let whereStr = "";
  let orderStr = "";
  let uniqueStr = "";
  let limitStr = "";
  if (options) {
    if (options.unique) {
      uniqueStr = "DISTINCT ";
    }
    if (options.innerJoins) {
      innerJoinsStr = options.innerJoins
        .map(
          (a) =>
            `INNER JOIN ${a.otherTableName} ON ${a.otherTableName}.${a.otherColumn}=${a.thisColumn}`
        )
        .join(" ");
      if (innerJoinsStr.length > 0) {
        innerJoinsStr = ` ${innerJoinsStr}`;
      }
    }
    if (options.whereColumn) {
      if (typeof options.whereColumn === "string") {
        whereStr = ` WHERE ${options.whereColumn}=?`;
      } else if (options.whereColumn.tableName !== undefined) {
        whereStr = ` WHERE ${options.whereColumn.tableName}.${options.whereColumn.columnName}=?`;
      } else {
        whereStr = ` WHERE ${tableName}.${options.whereColumn.columnName}=?`;
      }
    }
    if (options.orderBy) {
      orderStr =
        " ORDER BY " +
        options.orderBy
          .map(
            (order) => order.column + " " + (order.ascending ? "ASC" : "DESC")
          )
          .join(",");
    }
    if (options.limit) {
      limitStr = ` LIMIT ${options.limit}`;
      if (options.offset) {
        limitStr += ` OFFSET ${options.offset}`;
      }
    }
  }
  const columnStrings = columns.reduce(
    (previousVal: string[], currentValue) => {
      if (typeof currentValue === "string") {
        return previousVal.concat(currentValue);
      }
      let columnEntry = "";
      if (currentValue.tableName) {
        columnEntry += `${currentValue.tableName}.`;
      }
      columnEntry += currentValue.columnName;
      if (currentValue.alias) {
        columnEntry += ` AS ${currentValue.alias}`;
      }
      return previousVal.concat(columnEntry);
    },
    []
  );
  return (
    `SELECT ${uniqueStr}${columnStrings.join(",")} ` +
    `FROM ${tableName}${innerJoinsStr}${whereStr}${orderStr}${limitStr};`
  );
};

/**
 * Enum for table column types.
 *
 * <table><tr><th>Expression Affinity</th><th>Column Declared Type</th>
 * </tr><tr><td>TEXT                       </td><td>"TEXT"
 * </td></tr><tr><td>NUMERIC               </td><td>"NUM"
 * </td></tr><tr><td>INTEGER               </td><td>"INT"
 * </td></tr><tr><td>REAL                  </td><td>"REAL"
 * </td></tr><tr><td>BLOB (a.k.a "NONE")   </td><td>"" (empty string)
 * </td></tr></table>
 * Source: {@link https://www.sqlite.org/lang_createtable.html}.
 */
export enum CreateTableColumnType {
  TEXT = "TEXT",
  NUMERIC = "NUMERIC",
  INTEGER = "INTEGER",
  REAL = "REAL",
  BLOB = "BLOB",
}

export interface CreateTableColumnOptions {
  notNull?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
}

export interface CreateTableColumn {
  /**
   * Column name.
   */
  name: string;
  /**
   * Column type (`INTEGER`, `TEXT`).
   */
  type: CreateTableColumnType;
  /**
   * Column options (`NOT NULL`, `UNIQUE`, `PRIMARY KEY`).
   */
  options?: CreateTableColumnOptions;
  /**
   * Foreign key options.
   */
  foreign?: CreateTableColumnForeign;
}

export interface CreateTableColumnForeign {
  /**
   * Foreign key table name.
   */
  tableName: string;
  /**
   * Foreign key table column name.
   */
  column: string;
  /**
   * Options for foreign key (`ON DELETE CASCADE ON UPDATE NO ACTION`).
   */
  options?: string[];
}

/**
 * Create database table.
 *
 * @param tableName The name of the table.
 * @param columns The columns of the table.
 * @param ifNotExists Create table if not already existing.
 * @returns SQLite query.
 * @example ```sql
 * CREATE TABLE IF NOT EXISTS contacts (
 * contact_id INTEGER PRIMARY KEY,
 * first_name TEXT NOT NULL,
 * last_name TEXT NOT NULL,
 * email text NOT NULL UNIQUE,
 * phone text NOT NULL UNIQUE
 * );
 * ```
 */
export const createTable = (
  tableName: string,
  columns: CreateTableColumn[],
  ifNotExists = false
): string => {
  const columnOptionsToString = (
    columnOptions?: CreateTableColumnOptions
  ): string => {
    const columnOptionsArray = [];
    if (columnOptions) {
      if (columnOptions.primaryKey) {
        columnOptionsArray.push("PRIMARY KEY");
      }
      if (columnOptions.unique) {
        columnOptionsArray.push("UNIQUE");
      }
      if (columnOptions.notNull) {
        columnOptionsArray.push("NOT NULL");
      }
    }
    if (columnOptionsArray.length === 0) {
      return "";
    } else {
      return " " + columnOptionsArray.join(" ");
    }
  };
  const columnsString = columns
    .map((column) => {
      return (
        `${column.name} ${column.type}` +
        `${columnOptionsToString(column.options)}`
      );
    })
    .join(",");
  const foreignKeysString = columns
    .filter((column) => column.foreign !== undefined)
    .map((column) => {
      const foreign = column.foreign as CreateTableColumnForeign;
      return (
        `FOREIGN KEY (${column.name}) REFERENCES ${foreign.tableName} (${foreign.column})` +
        (foreign.options !== undefined ? " " + foreign.options.join(" ") : "")
      );
    });
  const foreignKeysStringFinal =
    foreignKeysString.length > 0 ? "," + foreignKeysString.join(",") : "";
  return (
    `CREATE TABLE ${ifNotExists ? "IF NOT EXISTS " : ""}${tableName} (` +
    `${columnsString}${foreignKeysStringFinal});`
  );
};

/**
 * Delete a database table.
 *
 * @param tableName Name of the table to delete.
 * @param ifExists Only remove table if it exists.
 * @returns SQLite query.
 * @example ```sql
 * DROP TABLE contacts;
 * DROP TABLE IF EXISTS contacts;
 * ```
 */
export const dropTable = (tableName: string, ifExists = false): string => {
  return `DROP TABLE ${ifExists ? "IF EXISTS " : ""}${tableName};`;
};

/**
 * Create database view.
 *
 * @param viewName Name of the view to create.
 * @param tableName Name of the table that the view is based on.
 * @param columns View columns.
 * @param options View creation options.
 * @param ifNotExists Create view if not already existing.
 * @returns SQLite query.
 * @example ```sql
 * CREATE VIEW IF NOT EXISTS leaderboard
 * AS
 * SELECT
 *     contacts.count,
 *     contacts.name
 * FROM
 *     contacts
 * ORDER BY
 *     contacts.count DESC
 * );
 * ```
 */
export const createView = (
  viewName: string,
  tableName: string,
  columns: (string | SelectColumn)[],
  options?: SelectQueryOptions,
  ifNotExists = false
): string => {
  return (
    `CREATE VIEW ${ifNotExists ? "IF NOT EXISTS " : ""}${viewName} AS ` +
    `${select(tableName, columns, options)}`
  );
};

/**
 * Delete a database view.
 *
 * @param viewName Name of the view to delete.
 * @param ifExists Only remove view if it exists.
 * @returns SQLite query.
 * @example ```sql
 * DROP VIEW leaderboard;
 * DROP VIEW IF EXISTS leaderboard;
 * ```
 */
export const dropView = (viewName: string, ifExists = false): string => {
  return `DROP VIEW ${ifExists ? "IF EXISTS " : ""}${viewName};`;
};

/**
 * Update database table row values.
 *
 * @param tableName Name of the table.
 * @param values Values that should be updated.
 * @param whereColumn Column where the row changes should be made.
 * @returns SQLite query.
 * @example ```sql
 * UPDATE employees
 * SET lastname = 'Smith', firstname = 'Jo'
 * WHERE
 * employeeid = 3
 * ```
 */
export const update = (
  tableName: string,
  values: string[],
  whereColumn = "id"
): string => {
  const setString = values.map((value) => `${value}=?`).join(",");
  return `UPDATE ${tableName} SET ${setString} WHERE ${whereColumn}=?;`;
};
