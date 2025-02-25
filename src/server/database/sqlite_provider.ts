import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { DataProvider } from "./data_provider.js";

export class SqliteDataProvider implements DataProvider
{
    private source?: Database;
    private readonly sourcePath: string;

    constructor(sourcePath: string)
    {
        this.sourcePath = sourcePath;
        this.connect();
    }

    get connected(): boolean { return this.source !== undefined; }

    async connect(): Promise<void> {
        if(this.connected) return;

        this.source = await open({
            filename: this.sourcePath,
            driver: sqlite3.Database
        });
    }

    async disconnect(): Promise<void> {
        if(!this.connected) return;

        await this.source!.close();
        this.source = undefined;
    }

    async select<T>(query: string, params?: any[]): Promise<T[]> {
        if(!this.connected) return [];
        return await this.source!.all(query, params);
    }

    async execute(query: string, params?: any[]): Promise<void> {
        if(!this.connected) return;
        await this.source!.run(query, params);
    }
}
