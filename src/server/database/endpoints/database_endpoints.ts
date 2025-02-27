import { sessionCookieLifetime } from "../../../server/session/session_secret.js";
import { DataProvider, DIALECT_MySQL, DIALECT_SQLITE } from "../providers/data_provider.js";
import { v4 as uuidv4 } from 'uuid';

export class DatabaseEndpoints
{
    private provider: DataProvider;

    constructor(provider: DataProvider)
    {
        this.provider = provider;
    }

    get dialect(): string { return this.provider.dialect; }
    get sqlite(): boolean { return this.provider.dialect === DIALECT_SQLITE; }
    get mysql(): boolean { return this.provider.dialect === DIALECT_MySQL; }

    public async init()
    {
        await this.provider.connect();
        let statements: string[] = [];

        statements.push(
            // --- Create Registered Accounts Table
            `CREATE TABLE IF NOT EXISTS userAccounts(
                username VARCHAR(31) PRIMARY KEY,
                mail VARCHAR(255) UNIQUE NOT NULL,
                user_id CHAR(36) UNIQUE NOT NULL,
                pwd_hash VARCHAR(60) NOT NULL,
                client_salt CHAR(16) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        );
        statements.push(
            // --- Create Session to user id links
            `CREATE TABLE IF NOT EXISTS userSessions(
                sess_id CHAR(32) NOT NULL PRIMARY KEY,
                user_id CHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES userAccounts(user_id)
            );`
        );
        await Promise.all(statements.map((sql) => this.provider.execute(sql)));
        this.startSessionCleanupLoop();
    }

    public startSessionCleanupLoop(period: number = 3600)
    { // TODO : Make sure the user isn't playing a game before deleting their session (Add 24 hours every time they log in ?)
        let sql: string;
        let args: any[];
        if(this.sqlite) {
            sql = "DELETE FROM userSessions WHERE created_at < DATETIME('now', ?);";
            args = [`-${sessionCookieLifetime} seconds`];
        } else {
            sql = "DELETE FROM userSessions WHERE created_at < NOW - INTERVAL ? SECOND;";
            args = [sessionCookieLifetime];
        }
        const cleanup = () => this.provider.execute(sql, args);
        setInterval(cleanup, period * 1000);
        cleanup();
    }

    public async createAccount(username: string, mail: string, pwd_hash: string, client_salt: string): Promise<any>
    {
        const uuid = uuidv4();
        const sql = "INSERT INTO userAccounts(username, mail, user_id, pwd_hash, client_salt) VALUES (?, ?, ?, ?, ?)";
        return this.provider.execute(sql, [ username, mail, uuid, pwd_hash, client_salt ]);
    }

    public async deleteAccount(username: string): Promise<any>
    {
        const sql = "DELETE FROM userAccounts WHERE username=?";
        return this.provider.execute(sql, [ username ]);
    }

}
