const { Database } = require('sqlite3');
const database = require('./database');

class BookDao {
    getAllBooks(callback){
        const db = database.getConnection();
        const sql = `SELECT * FROM books`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error while receiving books: ', err)
                callback(err, null)
            }
            else {
                callback(null, rows)
            }
            db.close()
        });
    }

    addBook(book, callback){
        const db = database.getConnection();
        const sql = `
            INSERT INTO books (title, author, pages, read_pages, year, status, rating, review, cover_filename) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            book.title,
            book.author,
            book.pages, 
            book.read_pages,
            book.year,
            book.status,
            book.rating,
            book.review,
            book.cover_filename
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error adding book: ', err);
                callback(err, null);
            } else {
                callback(null, this.lastID);
            }
            db.close();
        });
    }

    getBook(bookId, callback) {
        const db = database.getConnection();
        const sql = 'SELECT * FROM books WHERE id = ?'

        db.get(sql, [bookId], (err, row) =>{
            if (err){
                console.error('Error getting book: ', err);
                callback(err, null)
            }
            else {
                callback(null, row)
            }
            db.close()
        });
    }

    deleteBook(bookId, callback) {
        const db = database.getConnection();
        const sql = `DELETE FROM books WHERE id = ?`;
        
        db.run(sql, [bookId], function(err) {
            if (err) {
                console.error('Error deleting book: ', err);
                callback(err);
            } else {
                callback(null);
            }
            db.close();
        });
    }

    updateBook(id, book, callback){
        const db = database.getConnection();
        const sql = `UPDATE books SET 
            title = ?, 
            author = ?, 
            pages = ?, 
            read_pages = ?, 
            year = ?, 
            status = ?, 
            rating = ?, 
            review = ?, 
            cover_filename = ?
            WHERE id = ?
        `;
        const params = [
            book.title,
            book.author,
            book.pages, 
            book.read_pages,
            book.year,
            book.status,
            book.rating,
            book.review,
            book.cover_filename,
            id
        ];
        db.run(sql, params, function(err){
            if(err) {
                console.error("Error updating book in database:", err);
                return callback(err);
            }
            console.log(`Book ${id} updated successfully`);
            callback(null);
            db.close();
        })
    }
}

module.exports = new BookDao();