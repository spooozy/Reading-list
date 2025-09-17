const express = require("express");
const path = require('path');
const multer = require('multer');
const bookDao = require('./bookDao')
const PORT = 3000;
const app = express();
const fs = require('fs');
const { request } = require("http");
const coversDir = 'public/covers/';

if (!fs.existsSync(coversDir)) {
    console.log("Creating covers directory...")
    fs.mkdirSync(coversDir, { recursive: true });
    console.log('Covers directory initialized successfully');
}

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/covers/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileExtensionFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif'){
        cb(null, true)
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, PNG and GIF allowed"))
    }
}

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileExtensionFilter
});

app.get("/", function(request, response){
    bookDao.getAllBooks((err, books) => {
        if (err) {
            console.error("Error receiving books: ", err);
            return response.status(500).send("Server Error")
        }
    response.render('index', { books: books });
    });
});

app.get('/book/:id', (request, response) =>{
    const bookId = request.params.id;
    bookDao.getBook(bookId, (err, book) => {
        if(err){
            console.error("Error getting book: ", err)
            return response.status(500).send('Failed to get book')
        }
        if(!book){
            return response.status(404).json({error: 'Book not found'})
        }
        response.render("view-book", {book});
    })
})

app.get("/add", function(request, response){
    response.render('book-form', {
        isEdit: false,
        book: {},
        statusOptions: ['want to read', 'reading', 'finished'],
        ratingOptions: [1, 2, 3, 4, 5]
    });
});

app.get("/book/:id/edit", (request, response) => {
    const bookId = request.params.id;
    bookDao.getBook(bookId, (err, book) => {
        if (err) {
            console.log("Error getting book for edit: ", err);
            return response.status(500).send("Failed to get book for editing");
        }
        if(!book){
            return response.status(404).json({error: 'Book not found'})
        }
        response.render('book-form', {
            isEdit: true,
            book: book, 
            statusOptions: ['want to read', 'reading', 'finished'],
            ratingOptions: [1, 2, 3, 4, 5]
        });
    })
});

app.post('/book/:id/edit', upload.single('cover'), (request, response) => {
    const bookId = request.params.id;
    const validationErrors = validateBookData(request.body);
    if (validationErrors.length > 0) {
        return bookDao.getBook(bookId, (err, book) => {
            if (err) {
                console.error("Error getting book for re-edit: ", err);
                return response.status(500).send('Failed to get book');
            }
            const formData = { ...request.body };
            response.status(400).render('book-form', {
                isEdit: true,
                book: formData,
                error: validationErrors.join(', '),
                statusOptions: ['want to read', 'in progress', 'read'],
                ratingOptions: [1, 2, 3, 4, 5]
            });
        });
    }

    const updatedBook = {
        title: request.body.title, 
        author: request.body.author,
        pages: request.body.pages, 
        read_pages: request.body.read_pages,
        year: request.body.year ? parseInt(request.body.year) : null,
        status: request.body.status || 'want to read',
        rating: request.body.rating ? parseInt(request.body.rating) : null,
        review: request.body.review || '',
        cover_filename: request.file ? request.file.filename : request.body.existing_cover
    };

    bookDao.updateBook(bookId, updatedBook, (err) => {
        if (err) {
            console.error('Error updating book: ', err);
            return response.status(500).send('Failed to update book');
        }
        response.redirect(`/book/${bookId}`);
    });
});

app.post('/add', upload.single('cover'), (request, response) => {
    const validationErrors = validateBookData(request.body);
    if (validationErrors.length > 0){
        return response.status(400).render('book-form', {
            isEdit: false,
            book: {},
            statusOptions: ['want to read', 'reading', 'finished'],
            ratingOptions: [1, 2, 3, 4, 5],
            error: validationErrors.join(', '),
            formData: request.body
        });
    }

    const newBook ={
        title: request.body.title, 
        author: request.body.author,
        pages: request.body.pages, 
        read_pages: request.body.read_pages,
        year: request.body.year ? parseInt(request.body.year) : null,
        status: request.body.status || 'want to read',
        rating: request.body.rating ? parseInt(request.body.rating) : null,
        review: request.body.review || '',
        cover_filename: request.file ? request.file.filename : null
    };
    bookDao.addBook(newBook, (err, newBookId) => {
        if (err) {
            console.error('Error adding book: ', err);
            return response.status(500).send('Failed to add book');
        }
        response.redirect('/');
    });
});

app.post('/book/:id/delete', (request, response) => {
    const bookId = request.params.id;
    bookDao.deleteBook(bookId, (err) => {
        if (err) {
            console.error('Error deleting book: ', err);
            return response.status(500).send('Failed to delete book');
        }
        response.redirect('/');
    });
});

const validateBookData = (book) => {
    const errors = [];
    const currentYear = new Date().getFullYear();
    const validations = [
        {
            field: 'title',
            required: true,
            validate: (value) => value && value.trim().length > 0,
            message: 'Title is required'
        },
        {
            field: 'author',
            required: true,
            validate: (value) => value && value.trim().length > 0,
            message: 'Author is required'
        },
        {
            field: 'year',
            validate: (value) => !value || (value >= 0 && value <= currentYear),
            message: `Year must be between 0 and ${currentYear}`
        },
        {
            field: 'pages',
            validate: (value) => !value || value >= 1,
            message: 'Total pages must be at least 1'
        },
        {
            field: 'read_pages',
            validate: (value) => {
                if (!value) return true;
                if (value < 0) return false;
                if (book.pages < value) return false;
                return true;
            },
            message: 'Invalid pages read value'
        },
        {
            field: 'rating',
            validate: (value) => {
                if (!value && value !== 0) return true;
                const rating = parseInt(value);
                return !isNaN(rating) && Number.isInteger(rating) && rating >= 0 && rating <= 5;
            },
            message: 'Rating must be an integer between 0 and 5'
        },
        {
            field: 'status',
            validate: (value) => {
                if(value === 'want to read' || value === 'in progress' || value === 'read'){
                    return true;
                }
                return false;
            },
            message: "Status must be 'want to read', 'in progress' or 'read'"
        }
    ];
    validations.forEach(({ field, required, validate, message }) => {
        const value = book[field];
        if (required && (!value && value !== 0)) {
            errors.push(message);
        } else if (value !== undefined && value !== null && value !== '' && !validate(value)) {
            errors.push(message);
        }
    });

    return errors;
}

app.listen(PORT, () => {
    console.log(`Run server http://localhost:${PORT}`);
});
