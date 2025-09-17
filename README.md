## Reading List Manager

![](https://img.shields.io/badge/Node.js-22.x-green)
![](https://img.shields.io/badge/SQLite-3.x-blue)

### Features

- `Book Management` - Add, edit, and delete books from your library
- `Reading Progress` - Track pages read and reading status
- `Rating System` - Rate books from 1 to 5 stars
- `Local Storage` - Data persists in SQLite database
- `Filter` - Find books by reading status

### Getting Started

1. Clone the repository

`git clone https://github.com/yourusername/book-library.git`

`cd book-library`

2. Install dependencies

`npm install`

3. Start the application (creates database and tables)

`node index.js`

4. Add test data (optional)

`node init-test-data.js`

5. Open your browser

`http://localhost:3000`


### Test Data
The application includes sample data with 7 books:
- Various genres and authors
- Different reading statuses (read, reading, want to read)
- Example ratings and reviews
- No cover images (for simplified testing)


### Technologies Used
- `Backend`: Node.js, Express.js
- `Database`: SQLite3
- `Frontend`: HTML5, CSS3, JavaScript (ES6+)
- `Templating`: EJS
