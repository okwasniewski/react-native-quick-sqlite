/**
 * Object returned by SQL Query executions {
 *  insertId: Represent the auto-generated row id if applicable
 *  rowsAffected: Number of affected rows if result of a update query
 *  message: if status === 1, here you will find error description
 *  rows: if status is undefined or 0 this object will contain the query results
 * }
 *
 * @interface QueryResult
 */
export type QueryResult = {
  insertId?: number;
  rowsAffected: number;
  rows?: {
    /** Raw array with all dataset */
    _array: any[];
    /** The lengh of the dataset */
    length: number;
    /** A convenience function to acess the index based the row object
     * @param idx the row index
     * @returns the row structure identified by column names
     */
    item: (idx: number) => any;
  };
  /**
   * Query metadata, avaliable only for select query results
   */
  metadata?: ColumnMetadata[];
};

/**
 * Column metadata
 * Describes some information about columns fetched by the query
 */
export type ColumnMetadata = {
  /** The name used for this column for this resultset */
  columnName: string;
  /** The declared column type for this column, when fetched directly from a table or a View resulting from a table column. "UNKNOWN" for dynamic values, like function returned ones. */
  columnDeclaredType: string;
  /**
   * The index for this column for this resultset*/
  columnIndex: number;
};

/**
 * Allows the execution of bulk of sql commands
 * inside a transaction
 * If a single query must be executed many times with different arguments, its preferred
 * to declare it a single time, and use an array of array parameters.
 */
export type SQLBatchTuple = [string] | [string, Array<any> | Array<Array<any>>];

/**
 * status: 0 or undefined for correct execution, 1 for error
 * message: if status === 1, here you will find error description
 * rowsAffected: Number of affected rows if status == 0
 */
export type BatchQueryResult = {
  rowsAffected?: number;
};

/**
 * Result of loading a file and executing every line as a SQL command
 * Similar to BatchQueryResult
 */
export interface FileLoadResult extends BatchQueryResult {
  commands?: number;
}

export interface Transaction {
  commit: () => QueryResult;
  execute: (query: string, params?: any[]) => QueryResult;
  executeAsync: (
    query: string,
    params?: any[] | undefined
  ) => Promise<QueryResult>;
  rollback: () => QueryResult;
}

export interface PendingTransaction {
  /*
   * The start function should not throw or return a promise because the
   * queue just calls it and does not monitor for failures or completions.
   *
   * It should catch any errors and call the resolve or reject of the wrapping
   * promise when complete.
   *
   * It should also automatically commit or rollback the transaction if needed
   */
  start: () => void;
}

export interface ISQLite {
  open: (dbName: string, location?: string) => void;
  close: (dbName: string) => void;
  delete: (dbName: string, location?: string) => void;
  attach: (
    mainDbName: string,
    dbNameToAttach: string,
    alias: string,
    location?: string
  ) => void;
  detach: (mainDbName: string, alias: string) => void;
  transaction: (
    dbName: string,
    fn: (tx: Transaction) => Promise<void> | void
  ) => Promise<void>;
  execute: (dbName: string, query: string, params?: any[]) => QueryResult;
  executeAsync: (
    dbName: string,
    query: string,
    params?: any[]
  ) => Promise<QueryResult>;
  executeBatch: (dbName: string, commands: SQLBatchTuple[]) => BatchQueryResult;
  executeBatchAsync: (
    dbName: string,
    commands: SQLBatchTuple[]
  ) => Promise<BatchQueryResult>;
  loadFile: (dbName: string, location: string) => FileLoadResult;
  loadFileAsync: (dbName: string, location: string) => Promise<FileLoadResult>;
}

export type QuickSQLiteConnection = {
  close: () => void;
  delete: () => void;
  attach: (dbNameToAttach: string, alias: string, location?: string) => void;
  detach: (alias: string) => void;
  transaction: (fn: (tx: Transaction) => Promise<void> | void) => Promise<void>;
  execute: (query: string, params?: any[]) => QueryResult;
  executeAsync: (query: string, params?: any[]) => Promise<QueryResult>;
  executeBatch: (commands: SQLBatchTuple[]) => BatchQueryResult;
  executeBatchAsync: (commands: SQLBatchTuple[]) => Promise<BatchQueryResult>;
  loadFile: (location: string) => FileLoadResult;
  loadFileAsync: (location: string) => Promise<FileLoadResult>;
};