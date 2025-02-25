import { DataProvider } from "../providers/data_provider.js";
import { v4 as uuidv4 } from 'uuid';

export class DatabaseEndpoints
{
    private provider: DataProvider;

    constructor(provider: DataProvider)
    {
        this.provider = provider;
    }

    public async createTables()
    {
        this.provider.connect();
        let sql: string;

        // --- Create Registered Accounts Table
        sql = `CREATE TABLE IF NOT EXISTS accounts(
                    username VARCHAR(31) PRIMARY KEY,
                    mail VARCHAR(255) UNIQUE NOT NULL,
                    user_id CHAR(36) UNIQUE NOT NULL,
                    pwd_hash VARCHAR(60) NOT NULL,
                    client_salt CHAR(16) NOT NULL,
                    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;
        await this.provider.execute(sql);
        
        this.provider.disconnect();
    }

}

