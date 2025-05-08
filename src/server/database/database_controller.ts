import { DataProvider } from "./providers/data_provider.js";
import { SqlDataProvider } from "./providers/sql_provider.js";
import { SqliteDataProvider } from "./providers/sqlite_provider.js";
import { DatabaseEndpointsContainer } from "./endpoints/database_endpoints.js";
import { ConnectionOptions } from "mysql2";

export class DatabaseController
{
    private static instance?: DatabaseController;

    public static getInstance(): DatabaseController
    {
        if(DatabaseController.instance === undefined)
            throw new Error("Attempting to access DatabaseController instance before it was instantiated.");

        return DatabaseController.instance;
    }

    private _provider: DataProvider;
    private _endpoints: DatabaseEndpointsContainer;

    constructor(sqlitePath?: string, sqlOptions?: ConnectionOptions & { enabled?: boolean })
    {
        if(DatabaseController.instance !== undefined)
            throw new Error("Cannot instantiate more than one DatabaseController at a time.");
        DatabaseController.instance = this;

        if(sqlOptions !== undefined && sqlOptions.enabled) { delete sqlOptions.enabled; this._provider = new SqlDataProvider(sqlOptions); }
        else if(sqlitePath !== undefined) this._provider = new SqliteDataProvider(sqlitePath);
        else throw new Error("DatabaseController must be instantiated with at least one of `sqlitePath` and `sqlOptions` in production, and with sqlitePath in development.");
        
        this._endpoints = new DatabaseEndpointsContainer(this._provider);
    }
    
    get description(): string {
        let complement;
        if(this._provider instanceof SqlDataProvider) 
            complement = `MySQL ( ${this._provider.user}@${this._provider.host} --> ${this._provider.db} )`;
        else if (this._provider instanceof SqliteDataProvider)
            complement = `SQLite ( ${this._provider.path} )`;

        return "Server database: " + complement;
    }
    get provider(): DataProvider { return this._provider; }
    get endpoints(): DatabaseEndpointsContainer { return this._endpoints; }
}

export const getEndpoints = () => DatabaseController.getInstance().endpoints;
export const getProvider = () => DatabaseController.getInstance().provider;
