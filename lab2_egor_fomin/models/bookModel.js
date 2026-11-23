const books = [
    {
        id: 1,
        title: 'The Hobbit',
        authorId: 1,
        genre: 'fantasy',
        year: 1937
    },
    {
        id: 2,
        title: '1984',
        authorId: 2,
        genre: 'dystopia',
        year: 1949
    },
    {
        id: 3,
        title: 'Animal Farm',
        authorId: 2,
        genre: 'satire',
        year: 1945
    },
    {
        id: 4,
        title: 'Clean Code',
        authorId: 3,
        genre: 'programming',
        year: 2008
    },
    {
        id: 5,
        title: 'Node.js Design Patterns',
        authorId: 4,
        genre: 'programming',
        year: 2014
    },
    {
        id: 6,
        title: 'The Lord of the Rings',
        authorId: 1,
        genre: 'fantasy',
        year: 1954
    }
];

function getAllBooks() {
    return books;
}

function getBookById(id) {
    return books.find((book) => book.id === id);
}

function createBook(bookData) {
    const id = books.reduce((maxId, book) => Math.max(maxId, book.id), 0) + 1;
    const book = { id, ...bookData };
    books.push(book);
    return book;
}

function updateBook(id, changes) {
    const book = getBookById(id);
    if (!book) {
        return undefined;
    }

    Object.assign(book, changes);
    return book;
}

function deleteBook(id) {
    const index = books.findIndex((book) => book.id === id);
    if (index === -1) {
        return undefined;
    }

    return books.splice(index, 1)[0];
}

function getBooksByAuthorId(authorId) {
    return books.filter((book) => book.authorId === authorId);
}

function searchBooksByTitle(query) {
    const normalizedQuery = query.toLowerCase();
    return books.filter((book) => book.title.toLowerCase().includes(normalizedQuery));
}

function getStatistics(authorCount) {
    const newestBook = books.reduce(
        (newest, book) => (book.year > newest.year ? book : newest),
        books[0]
    );
    const oldestBook = books.reduce(
        (oldest, book) => (book.year < oldest.year ? book : oldest),
        books[0]
    );

    return {
        bookCount: books.length,
        authorCount,
        genreCount: new Set(books.map((book) => book.genre)).size,
        newestBook,
        oldestBook
    };
}

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getBooksByAuthorId,
    searchBooksByTitle,
    getStatistics
};
