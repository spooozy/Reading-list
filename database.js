const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'data', 'library.db');
        this.db = null;
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const dbExists = fs.existsSync(this.dbPath);
            if (!dbExists) {
                console.log('Initializing database...');
                this.setupDatabase();
                console.log('Database initialized successfully');
            }
            this.initialized = true;
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    setupDatabase() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.run(`
                CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                year INTEGER,
                pages INTEGER,
                read_pages INTEGER,
                status TEXT DEFAULT 'want to read',
                rating INTEGER,
                review TEXT,
                cover_filename TEXT
            )`, (err) => {
                db.close();
                if (err) reject(err);
                else resolve();
            });
        });
    }

    getConnection() {
        if (!this.initialized) {
            throw new Error('Database not initialized');
        }
        return new sqlite3.Database(this.dbPath);
    }
}

module.exports = new Database();