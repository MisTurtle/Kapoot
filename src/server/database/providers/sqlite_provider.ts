import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { DataProvider, DIALECT_SQLITE } from "./data_provider.js";

export class SqliteDataProvider implements DataProvider
{
    private source?: Database;
    private readonly sourcePath: string;

    constructor(sourcePath: string)
    {
        this.sourcePath = sourcePath;
    }

    get path(): string { return this.sourcePath; }
    get connected(): boolean { return this.source !== undefined; }
    get dialect(): string { return DIALECT_SQLITE; }

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

    async execute(query: string, params?: any[]): Promise<any> {
        if(!this.connected) throw new Error('Executing query on closed provider');
        return await this.source!.run(query, params);
    }
    
    async query(query: string): Promise<any> {
        if(!this.connected) throw new Error('Executing query on closed provider');
        return await this.source!.exec(query);
    }
}
