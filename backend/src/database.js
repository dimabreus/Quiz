import sqlite3 from 'sqlite3';

let db = null;

export async function initDatabase() {
    if (db) return db;

    return new Promise((resolve, reject) => {
        db = new sqlite3.Database('./database.sqlite', (err) => {
            if (err) {
                reject(err);
                return;
            }

            db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    login TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS registration_tokens (
                    token TEXT PRIMARY KEY,
                    email TEXT NOT NULL,
                    login TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(db);
            });
        });
    });
}

export async function getDatabase() {
    if (!db) {
        await initDatabase();
    }
    return db;
}
