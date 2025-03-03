import { sessionCookieLifetime } from "../../../server/session/session_secret.js";
import { DataProvider, DIALECT_MySQL, DIALECT_SQLITE } from "../providers/data_provider.js";
import { v4 as uuidv4 } from 'uuid';


export class DatabaseEndpointsContainer
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
                user_id CHAR(36) UNIQUE PRIMARY KEY,
                username VARCHAR(32) UNIQUE NOT NULL,
                mail VARCHAR(255) UNIQUE NOT NULL,
                pwd_hash VARCHAR(60) NOT NULL,
                client_salt CHAR(16) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        );
        statements.push(
            // --- Create Session to user id links
            `CREATE TABLE IF NOT EXISTS userSessions(
                sess_id CHAR(32) NOT NULL PRIMARY KEY,
                user_id CHAR(36) DEFAULT NULL,
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

    // --- TODO : Tests for all the functions below
    public async createAccount(username: string, mail: string, pwd_hash: string, client_salt: string): Promise<UserIdentifier>
    {
        const uuid = uuidv4();
        const sql = "INSERT INTO userAccounts(username, mail, user_id, pwd_hash, client_salt) VALUES (?, ?, ?, ?, ?)";
        return this.provider.execute(sql, [ username, mail, uuid, pwd_hash, client_salt ]).then(() => { return { username: username, identifier: uuid }; });
    }

    public async accountExists(user: UserIdentifier): Promise<UserIdentifier | undefined>
    {
        const sql = "SELECT username, user_id, mail FROM userAccounts WHERE UPPER(username)=UPPER(?) OR UPPER(user_id)=UPPER(?) OR UPPER(mail)=UPPER(?) LIMIT 1";
        return this.provider.select(sql, [ user.username, user.identifier, user.mail ]).then((result: any[]) => { 
            if(result.length === 0) return undefined;
            return { username: result[0].username, identifier: result[0].user_id };
         });
    }

    public async deleteAccount(user: UserIdentifier): Promise<any>
    {
        const sql = "DELETE FROM userAccounts WHERE UPPER(username)=UPPER(?) OR UPPER(user_id)=UPPER(?) OR UPPER(mail)=UPPER(?)";
        return this.provider.execute(sql, [ user.username, user.identifier, user.mail ]);
    }

    public async getAccountFromSession(sessionID: string, full: boolean = false): Promise<UserIdentifier | undefined>
    {
        let sql = "SELECT user_id FROM userSessions WHERE sess_id=? LIMIT 1";
        if(full) sql = "SELECT b.user_id as user_id, b.username as username, b.mail as mail FROM userSessions a LEFT JOIN userAccounts b ON a.user_id=b.user_id W AND a.sess_id=?";
        
        return this.provider.select(sql, [ sessionID ]).then((result: any) => { 
            if(result.length === 0) return undefined;
            if(!full) return { identifier: result[0].user_id };
            return { identifier: result[0].user_id, username: result[0].username, mail: result[0].mail };
        });
    }
}
