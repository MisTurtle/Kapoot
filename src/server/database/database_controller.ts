import { production } from "common/utils.js";
import { DataProvider } from "./providers/data_provider.js";
import { SqlDataProvider } from "./providers/sql_provider.js";
import { SqliteDataProvider } from "./providers/sqlite_provider.js";
import { DatabaseEndpoints } from "./endpoints/database_endpoints.js";
import { ConnectionOptions } from "mysql2";

export class DatabaseController
{
    private _provider: DataProvider;
    private _endpoints: DatabaseEndpoints;

    constructor(sqlitePath?: string, sqlOptions?: ConnectionOptions)
    {
        if(production && sqlOptions !== undefined) { this._provider = new SqlDataProvider(sqlOptions); }
        else if(sqlitePath !== undefined) this._provider = new SqliteDataProvider(sqlitePath);
        else throw new Error("DatabaseController must be instantiated with at least one of `sqlitePath` and `sqlOptions` in production, and with sqlitePath in development.");
        
        this._endpoints = new DatabaseEndpoints(this._provider);
    }
    
    get provider(): DataProvider { return this._provider; }
    get endpoints(): DatabaseEndpoints { return this._endpoints; }
}
