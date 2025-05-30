import { DataProvider, DIALECT_MySQL } from "./data_provider.js";
import mysql from 'mysql2/promise';

export class SqlDataProvider implements DataProvider
{
    private readonly options: mysql.ConnectionOptions;
    private source?: mysql.Connection;

    constructor(options: mysql.ConnectionOptions)
    {
        this.options = options;
    }

    get user(): string { return this.options.user ?? ""; }
    get host(): string { return this.options.host ?? ""; }
    get db(): string { return this.options.database ?? ""; }

    get connected(): boolean { return this.source !== undefined; }
    get dialect(): string { return DIALECT_MySQL; }

    async connect(): Promise<void> {
        if(this.connected) return;
        
        this.source = await mysql.createConnection(this.options);
    }
    
    async disconnect(): Promise<void> {
        if(!this.connected) return;

        await this.source!.end();
        this.source = undefined;
    }

    async select<T>(query: string, params?: any[]): Promise<T[]> {
        if(!this.connected) return [];

        const [ rows ] = await this.source!.execute<mysql.RowDataPacket[]>(query, params);
        return rows as T[];
    }
    
    async execute(query: string, params?: any[]): Promise<any> {
        if(!this.connected) throw new Error('Executing query on closed provider');
        return await this.source!.execute(query, params);
    }

    async query(query: string): Promise<any> {
        if(!this.connected) throw new Error('Executing query on closed provider');
        return await this.source!.query(query);
    }
}