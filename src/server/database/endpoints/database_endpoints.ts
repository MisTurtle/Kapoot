import session from "express-session";
import { sessionCookieLifetime } from "@server/session/session_secret.js";
import { DataProvider, DIALECT_MySQL, DIALECT_SQLITE } from "../providers/data_provider.js";
import { v4 as uuidv4 } from 'uuid';
import { verify } from "@server/utils/security.js";


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

        await this.provider.execute(
            // --- User accounts table
            `CREATE TABLE IF NOT EXISTS userAccounts(
                user_id CHAR(36) PRIMARY KEY,
                username VARCHAR(32) UNIQUE NOT NULL,
                mail VARCHAR(255) UNIQUE NOT NULL,
                pwd_hash VARCHAR(60) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        );
        await this.provider.execute(
            // --- Every session id created and that are still valid (or at least that haven't been cleaned up yet)
            `CREATE TABLE IF NOT EXISTS allSessions(
                sess_id CHAR(32) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        );
        await this.provider.execute(
            // --- Link between session ids and user accounts
            `CREATE TABLE IF NOT EXISTS userSessions(
                sess_id CHAR(32) PRIMARY KEY,
                user_id CHAR(36) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES userAccounts(user_id) ON DELETE CASCADE,
                FOREIGN KEY (sess_id) REFERENCES allSessions(sess_id) ON DELETE CASCADE
            );`
        );
        await this.provider.execute(
            // --- Store quizzes created by users
            `CREATE TABLE IF NOT EXISTS quizzes(
                quizz_id CHAR(36) PRIMARY KEY,
                user_id CHAR(36) NOT NULL,
                params TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES userAccounts(user_id) ON DELETE CASCADE
            );`
        );
        await this.provider.execute(
            // --- Store user_data created by users
            `CREATE TABLE IF NOT EXISTS user_data(
                user_id CHAR(36) PRIMARY KEY,
                quizzes_created INTEGER DEFAULT 0,
                games_played INTEGER DEFAULT 0,
                total_points INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES userAccounts(user_id) ON DELETE CASCADE
            );`
        );

        // vvv The following trigger works with SQLITE (because of serialized mode), but breaks with MySQL vvv
        // await this.provider.query(
        //     // --- Remove previous trigger to take changes into account
        //     `DROP TRIGGER IF EXISTS quizz_last_update`
        // );
        // await this.provider.query(
        //     // --- Create trigger to automatically update quizzes last change time (FIXME: SQLITE syntaxe, won't work for MySQL)
        //     `CREATE TRIGGER quizz_last_update
        //      AFTER UPDATE ON quizzes
        //      FOR EACH ROW
        //      BEGIN
        //         UPDATE quizzes SET updated_at=CURRENT_TIMESTAMP WHERE quizz_id=OLD.quizz_id;
        //      END;`
        // );
        await this.provider.query(
            // --- Remove previous trigger to take changes into account
            `DROP TRIGGER IF EXISTS quizzes_created_update`
        );
        await this.provider.query(
            // --- Create trigger to automatically update user_data quizzes created number (+1)
            `CREATE TRIGGER quizzes_created_update
             AFTER INSERT ON quizzes
             FOR EACH ROW
             BEGIN
                UPDATE user_data
                SET quizzes_created = quizzes_created + 1
                WHERE user_id = NEW.user_id;
             END;`
        );
        await this.provider.query(
            // --- Remove previous trigger to take changes into account
            `DROP TRIGGER IF EXISTS quizzes_deleted_update`
        );
        await this.provider.query(
            // --- Create trigger to automatically update user_data quizzes created number (-1)
            `CREATE TRIGGER quizzes_deleted_update
             AFTER DELETE ON quizzes
             FOR EACH ROW
             BEGIN
                UPDATE user_data
                SET quizzes_created = quizzes_created - 1
                WHERE user_id = OLD.user_id;
             END;`
        );
        
        // statements.push(
        //     // --- Table to store questions (Maybe useless though, we might store everything in quizzes)
        //     `CREATE TABLE IF NOT EXISTS question(
        //         question_id CHAR(36) UNIQUE PRIMARY KEY,
        //         quizz_id CHAR(36) UNIQUE NOT NULL,
        //         question TEXT UNIQUE NOT NULL,
        //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        //         FOREIGN KEY (quizz_id) REFERENCES quizz(quizz_id)
        //     );`
        // );
    
        this.startSessionCleanupLoop();
    }

    /**
     * @param period Delay in seconds between each automatic session cleanup
     */
    public startSessionCleanupLoop(period: number = 3600)
    {
        let sql: string;
        let args: any[];

        if(this.sqlite) {
            sql = "DELETE FROM allSessions WHERE created_at < DATETIME('now', ?);";
            args = [`-${Math.floor(sessionCookieLifetime / 1000)} seconds`];
        } else {
            sql = "DELETE FROM allSessions WHERE created_at < NOW() - INTERVAL ? SECOND;";
            args = [Math.floor(sessionCookieLifetime / 1000)];
        }

        const cleanup = () => this.provider.execute(sql, args);
        setInterval(cleanup, period * 1000);
        cleanup();
    }

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
        await this.provider.execute(sql, [ username, mail, uuid, pwd_hash ]);
        const sql_data = "INSERT INTO user_data(user_id, quizzes_created, games_played, total_points) VALUES (?, 0, 0, 0)";
        await this.provider.execute(sql_data, [ uuid ]);
        return { username: username, identifier: uuid };
    }

    public async accountExists(user: UserIdentifier): Promise<UserIdentifier | undefined>
    {
        const sql = "SELECT username, user_id, mail FROM userAccounts WHERE UPPER(username)=UPPER(?) OR UPPER(user_id)=UPPER(?) OR UPPER(mail)=UPPER(?) LIMIT 1";
    
        const result: any[] = await this.provider.select(sql, [ user.username ?? null, user.identifier ?? null, user.mail ?? null ]);
         
        if(result.length === 0) return undefined;
        return { username: result[0].username, identifier: result[0].user_id };
    }

    public async accountDetails(user: UserIdentifier): Promise<AccountDetails | undefined>
    {
        const sql = "SELECT * FROM user_data WHERE user_id = ?;"
        const result: any[] = await this.provider.select(sql, [ user.identifier ]);
        
        if(result.length === 0) return undefined;
        return { 
            identifier: result[0].user_id,
            username: user.username,
            mail: user.mail,
            avatar: `${result[0].user_id}.png`,
            quizzes_created: result[0].quizzes_created,
            games_played: result[0].games_played,
            total_points: result[0].total_points 
        };
    }

    public async deleteAccount(user: UserIdentifier): Promise<any>
    {
        const sql = "DELETE FROM userAccounts WHERE UPPER(username)=UPPER(?) OR UPPER(user_id)=UPPER(?) OR UPPER(mail)=UPPER(?)";
        return this.provider.execute(sql, [ user.username ?? null, user.identifier ?? null, user.mail ?? null ]);
    }

    public async verifyLogin(user: UserIdentifier, raw_password: string): Promise<UserIdentifier | undefined>
    {
        const sql = "SELECT user_id, username, mail, pwd_hash FROM userAccounts WHERE user_id=? OR username=? OR mail=?";
        const result: any[] = await this.provider.select(sql, [ user.identifier ?? null, user.username ?? null, user.mail ?? null ]);
       
        if(result.length !== 1) return undefined;
        const valid = await verify(raw_password, result[0].pwd_hash);
        if(!valid) return undefined;
        
        return { identifier: result[0].user_id, username: result[0].username, mail: result[0].mail };
    }

    /**
     * All sessions management (even for unregistered users)
     */
    public async loadSession(sid: string): Promise<session.SessionData | undefined>
    {
        const sql = "SELECT * FROM allSessions WHERE sess_id=? LIMIT 1";
        const rows = await this.provider.select(sql, [ sid ]);
        if(rows.length === 0) return undefined;

        const info: any = rows[0];
        const last_access = new Date(info.last_access);
        last_access.setTime(last_access.getTime() + sessionCookieLifetime);
        if(last_access.getTime() < Date.now()) return undefined; // Expired cookie
        
        // Renew the last access time
        const sql2 = "UPDATE allSessions SET last_access=CURRENT_TIMESTAMP WHERE sess_id=?";
        await this.provider.execute(sql2, [ sid ]);

        return { 'cookie': new session.Cookie() };
    }

    public async allSessions(): Promise<any[]>
    {
        let sql = "SELECT * FROM allSessions";
        return this.provider.select(sql);
    }

    public async saveSession(sid: string): Promise<void>
    {
        const sql = "INSERT INTO allSessions (sess_id) VALUES (?)";
        return this.provider.execute(sql, [ sid ]);
    }

    public async closeSessions(user: UserIdentifier): Promise<void>
    {
        const sql = "DELETE FROM allSessions WHERE sess_id IN (SELECT sess_id FROM userSessions WHERE user_id=?)";
        return this.provider.execute(sql, [ user.identifier ]);
    }

    /**
     * User accounts links
     */
    public async linkAccountToSession(user: UserIdentifier, sessionId: string): Promise<any>
    {
        if(!user.identifier) return undefined;

        const sql1 = "DELETE FROM userSessions WHERE sess_id=?";
        const sql2 = "INSERT INTO userSessions (sess_id, user_id) VALUES (?, ?)";

        await this.provider.execute(sql1, [ sessionId ]);
        await this.provider.execute(sql2, [ sessionId, user.identifier ]);
    }

    public async getAccountFromSession(sessionID: string, full: boolean = false): Promise<UserIdentifier | undefined>
    {
        let sql = "SELECT user_id FROM userSessions WHERE sess_id=? LIMIT 1";
        if(full) sql = "SELECT b.user_id as user_id, b.username as username, b.mail as mail FROM userSessions a INNER JOIN userAccounts b ON a.user_id=b.user_id AND a.sess_id=?";
        
        const result: any = await this.provider.select(sql, [ sessionID ]); 
        if(result.length === 0) return undefined;
        if(!full) return { identifier: result[0].user_id };
        return { identifier: result[0].user_id, username: result[0].username, mail: result[0].mail };
    }

    public async allUserSessions(): Promise<any[]>
    {
        let sql = "SELECT * FROM userSessions";
        return this.provider.select(sql);
    }

    /**
     * Quizz creation and modifications
     */
    /**
     * @param owner Quizz owner, needs to contain the user identifier
     * @param params Default serialized values for the quizz
     * @returns An identifier to the quizz entry
     */
    public async createQuizz(owner: UserIdentifier, params: string): Promise<QuizzIdentifier | undefined>
    {
        if(!owner.identifier) return undefined;
        // TODO : Add a limit to the number of quizzes a user can have? (Store that limit in a constant.ts file in utils, probably)

        const quizz_id = uuidv4();
        const sql = "INSERT INTO quizzes (quizz_id, user_id, params) VALUES (?, ?, ?)";
        await this.provider.execute(sql, [ quizz_id, owner.identifier, params ]);

        return quizz_id;
    }

    /**
     * @param quizz_id An identifier to the quizz
     * @returns The serialized data to reconstruct the quizz
     */
    public async getSerializedQuizz(user: UserIdentifier, quizz_id: QuizzIdentifier): Promise<string | undefined>
    {
        if(!user.identifier) return undefined;

        const sql = "SELECT params FROM quizzes WHERE user_id=? AND quizz_id=? LIMIT 1";
        const result: any[] = await this.provider.select(sql, [ user.identifier, quizz_id ]);

        if(result.length === 0) return undefined;
        return result[0].params;
    }
    public async getUserSerializedQuizzes(user_id: UserIdentifier): Promise<SerializedQuizz[] | undefined>
    {
        const sql = "SELECT quizz_id, params, created_at, updated_at from quizzes WHERE user_id=?";
        const result: SerializedQuizz[] = await this.provider.select(sql, [ user_id.identifier ]);
        return result;
    }

    public async deleteQuizz(owner: UserIdentifier, quizz_id: QuizzIdentifier): Promise<void>
    {        
        if(!owner.identifier) return;
        
        const sql = "DELETE FROM quizzes WHERE quizz_id=? AND user_id=?";
        return this.provider.execute(sql, [ quizz_id, owner.identifier ]);
    }
    public async updateQuizz(owner: UserIdentifier, params: string, quizz_id: QuizzIdentifier): Promise<void>
    {
        if(!owner.identifier) return;

        const sql = "UPDATE quizzes SET params=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND quizz_id=?";
        return await this.provider.execute(sql, [ params, owner.identifier, quizz_id ]);
    }
    public async allQuizzes(): Promise<{ user_id: string; quizz_id: string; params: string; }[]>
    {        
        const sql = "SELECT * from quizzes";
        return this.provider.select(sql);
    }

    /**
     * Game statistics
     */
    public async addGameStats(user: UserIdentifier, n_games: number, n_points: number) {
        if(!user.identifier) return;
        const stats = await this.getUserAccountData(user.identifier);
        if(!stats) return;  // This never happens

        const sql = "UPDATE user_data SET games_played=?, total_points=? WHERE user_id=?";
        return await this.provider.execute(sql, [ 
            stats.games_played + n_games,
            stats.total_points + n_points,
            user.identifier
         ]);
    }

    /**
     * User statistics 
     */
    public async allUserData(): Promise<any[]>
    {
        let sql = "SELECT * FROM user_data";
        return this.provider.select(sql);
    }
    public async getUserAccountData(user_id: string): Promise<AccountDetails | undefined>
    {
        const sql = "SELECT * FROM user_data WHERE user_id = ?;"
        const result: any[] = await this.provider.select(sql, [ user_id ]);
        
        if(result.length === 0) return undefined;
        return { 
            identifier: result[0].user_id,
            avatar: `${result[0].user_id}.png`,
            quizzes_created: result[0].quizzes_created,
            games_played: result[0].games_played,
            total_points: result[0].total_points 
        };
    }
}
