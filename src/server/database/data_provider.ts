export interface DataProvider
{
    get connected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    select<T>(query: string, params?: any[]): Promise<T[]>;
    execute(query: string, params?: any[]): Promise<void>;
}
