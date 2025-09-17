const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'library.db');

const testBooks = [
    {
        title: "Crime and Punishment",
        author: "Fyodor Dostoevsky",
        pages: 672,
        read_pages: 672,
        year: 1866,
        status: "read",
        rating: 5,
        review: "A profound novel about moral dilemmas and redemption",
        cover_filename: null
    },
    {
        title: "1984",
        author: "George Orwell",
        pages: 328,
        read_pages: 150,
        year: 1949,
        status: "in progress",
        rating: 4,
        review: "Disturbingly relevant even today",
        cover_filename: null
    },
    {
        title: "The Master and Margarita",
        author: "Mikhail Bulgakov",
        pages: 480,
        read_pages: 0,
        year: 1967,
        status: "want to read",
        rating: 0,
        review: "",
        cover_filename: null
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        pages: 281,
        read_pages: 281,
        year: 1960,
        status: "read",
        rating: 5,
        review: "A beautiful story about justice and childhood",
        cover_filename: null
    },
    {
        title: "Dune",
        author: "Frank Herbert",
        pages: 412,
        read_pages: 0,
        year: 1965,
        status: "want to read",
        rating: 0,
        review: "",
        cover_filename: null
    },
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        pages: 180,
        read_pages: 180,
        year: 1925,
        status: "read",
        rating: 4,
        review: "A classic American novel about the Jazz Age",
        cover_filename: null
    },
    {
        title: "Harry Potter and the Philosopher's Stone",
        author: "J.K. Rowling",
        pages: 320,
        read_pages: 320,
        year: 1997,
        status: "read",
        rating: 5,
        review: "Magical beginning of an amazing series",
        cover_filename: null
    }
];

function insertTestData(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO books (title, author, pages, read_pages, year, status, rating, review, cover_filename) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let insertedCount = 0;
        const totalBooks = testBooks.length;

        testBooks.forEach(book => {
            db.run(sql, [
                book.title,
                book.author,
                book.pages,
                book.read_pages,
                book.year,
                book.status,
                book.rating,
                book.review,
                book.cover_filename
            ], function(err) {
                if (err) {
                    console.error('Error inserting book:', err.message);
                    reject(err);
                    return;
                } else {
                    insertedCount++;
                    console.log(`✓ Added: "${book.title}" by ${book.author}`);
                }

                if (insertedCount === totalBooks) {
                    resolve();
                }
            });
        });
    });
}

async function initializeTestData() {
    console.log('Starting test data initialization...');
    
    const db = new sqlite3.Database(dbPath);

    try {
        const row = await new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
                if (err) {
                    if (err.message.includes('no such table')) {
                        console.log('Books table does not exist yet. Please start the application first to create tables.');
                        resolve({ count: 0 });
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(row);
                }
            });
        });

        if (row.count > 0) {
            console.log('ℹTable already contains data. Skipping test data insertion.');
            db.close();
            return;
        }

        console.log('Adding test books to database...');
        await insertTestData(db);
        
        console.log('\nTest data initialization completed successfully!');
        console.log(`Added ${testBooks.length} test books without covers`);
        console.log('\nYou can now start the application and see the test data.');

    } catch (error) {
        console.error('Error during initialization:', error.message);
        console.log('Make sure the application has been started at least once to create the database tables.');
    } finally {
        db.close();
    }
}

if (require.main === module) {
    initializeTestData().catch(console.error);
}

module.exports = initializeTestData;