import session from "express-session";
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
            // --- Create registered accounts table
            `CREATE TABLE IF NOT EXISTS userAccounts(
                user_id CHAR(36) UNIQUE PRIMARY KEY,
                username VARCHAR(32) UNIQUE NOT NULL,
                mail VARCHAR(255) UNIQUE NOT NULL,
                pwd_hash VARCHAR(60) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        );
        statements.push(
            // --- Table to store every session id (data source for express-session)
            `CREATE TABLE IF NOT EXISTS allSessions(
                sess_id CHAR(32) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        );
        statements.push(
            // --- Create session to user id links
            `CREATE TABLE IF NOT EXISTS userSessions(
                sess_id CHAR(32) UNIQUE NOT NULL,
                user_id CHAR(36) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES userAccounts(user_id),
                FOREIGN KEY (sess_id) REFERENCES allSessions(sess_id)
            );`
        );
        await Promise.all(statements.map((sql) => this.provider.execute(sql)));
    }

    // --- TODO : Tests for all the functions below

    /**
     * User accounts listing, registration and deletion
     */
    public async allAccounts(): Promise<unknown[] | undefined>
    {
        const sql = "SELECT * FROM userAccounts";
        return this.provider.select(sql);
    }

    public async createAccount(username: string, mail: string, pwd_hash: string): Promise<UserIdentifier>
    {
        const uuid = uuidv4();
        const sql = "INSERT INTO userAccounts(username, mail, user_id, pwd_hash) VALUES (?, ?, ?, ?)";
        return this.provider.execute(sql, [ username, mail, uuid, pwd_hash ]).then(() => { return { username: username, identifier: uuid }; });
    }

    public async accountExists(user: UserIdentifier): Promise<UserIdentifier | undefined>
    {
        const sql = "SELECT username, user_id, mail FROM userAccounts WHERE UPPER(username)=UPPER(?) OR UPPER(user_id)=UPPER(?) OR UPPER(mail)=UPPER(?) LIMIT 1";
    
        return this.provider.select(sql, [ user.username, user.identifier, user.mail ]).then((result: any[]) => { 
            if(result.length === 0) return undefined;
            return { username: result[0].username, identifier: result[0].user_id };
         });
    }

    public async accountDetails(user: UserIdentifier): Promise<AccountDetails | undefined>
    {
        // TODO: Fill in actual information like statistics etc.
        return { username: "Placeholder Name", mail: "Placeholder Email" };
    }

    public async deleteAccount(user: UserIdentifier): Promise<any>
    {
        const sql = "DELETE FROM userAccounts WHERE UPPER(username)=UPPER(?) OR UPPER(user_id)=UPPER(?) OR UPPER(mail)=UPPER(?)";
        return this.provider.execute(sql, [ user.username, user.identifier, user.mail ]);
    }

    /**
     * All sessions management (even for unregistered users)
     */
    public async loadSession(sid: string): Promise<session.SessionData | undefined>
    {
        const sql = "SELECT * FROM allSessions WHERE sess_id=? LIMIT 1";
        return this.provider.select(sql, [ sid ]).then((rows) => {
            if(rows.length === 0) return undefined;
            return { 'cookie': new session.Cookie() };
        })
    }

    public async allSessions(): Promise<any[]>
    {
        let sql = "SELECT * FROM allSessions";
        return this.provider.select(sql);
    }

    public async saveSession(sid: string): Promise<null>
    {
        const sql = "INSERT INTO allSessions (sess_id) VALUES (?)";
        return this.provider.execute(sql, [ sid ]);
    }

    /**
     * User accounts links
     */
    public async linkAccountToSession(user: UserIdentifier, sessionId: string): Promise<any>
    {
        if(!user.identifier) return undefined;

        const sql1 = "DELETE FROM userSessions WHERE sess_id=?";
        const sql2 = "INSERT INTO userSessions (sess_id, user_id) VALUES (?, ?)";

        return this.provider.execute(sql1, [ sessionId ])
        .then(result => this.provider.execute(sql2, [ sessionId, user.identifier ]));
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

    public async allUserSessions(): Promise<any[]>
    {
        let sql = "SELECT * FROM userSessions";
        return this.provider.select(sql);
    }
}
