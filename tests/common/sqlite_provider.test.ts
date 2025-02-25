import { SqliteDataProvider } from '../../src/server/database/sqlite_provider';


describe('SQLiteProvider', () => {
    let db: SqliteDataProvider;

    beforeAll(async () => {
        db = new SqliteDataProvider("./test_db.sqlite");
        await db.connect();
    });

    afterAll(async () => {
        await db.execute('DROP TABLE IF EXISTS users');
        await db.disconnect();
    });

    beforeEach(async () => {
        await db.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');
        await db.execute('DELETE FROM users');
    });

    it('should insert a user into the database', async () => {
        await db.execute('INSERT INTO users (name) VALUES (?)', ['Alice']);
        const users = await db.select<{ id: number; name: string }>('SELECT * FROM users');

        expect(users).toHaveLength(1);
        expect(users[0].name).toBe('Alice');
    });

    it('should return an empty list when no users are present', async () => {
        const users = await db.select<{ id: number; name: string }>('SELECT * FROM users');
        expect(users).toHaveLength(0);
    });

    it('should update a user\'s name', async () => {
        await db.execute('INSERT INTO users (name) VALUES (?)', ['Bob']);
        await db.execute('UPDATE users SET name = ? WHERE name = ?', ['Robert', 'Bob']);

        const users = await db.select<{ id: number; name: string }>('SELECT * FROM users');
        expect(users[0].name).toBe('Robert');
    });

    it('should delete a user from the database', async () => {
        await db.execute('INSERT INTO users (name) VALUES (?)', ['Charlie']);
        await db.execute('DELETE FROM users WHERE name = ?', ['Charlie']);

        const users = await db.select<{ id: number; name: string }>('SELECT * FROM users');
        expect(users).toHaveLength(0);
    });
});
