export const DIALECT_SQLITE = 'sqlite';
export const DIALECT_MySQL  = 'mysql';

export interface DataProvider
{
    get connected(): boolean;
    get dialect(): string;
    
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    select<T>(query: string, params?: any[]): Promise<T[]>;
    execute(query: string, params?: any[]): Promise<any>;
    // TODO : Might be useful --> async bulk(query: string, generator: Callable)
}
