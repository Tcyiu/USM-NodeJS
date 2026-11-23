const bookModel = require('../models/bookModel');
const authorModel = require('../models/authorModel');

const editableFields = ['title', 'authorId', 'genre', 'year'];

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isValidBookField(field, value) {
    if (field === 'title' || field === 'genre') {
        return isNonEmptyString(value);
    }

    if (field === 'authorId' || field === 'year') {
        return Number.isInteger(value);
    }

    return false;
}

function getInvalidFields(book) {
    return editableFields.filter((field) => !isValidBookField(field, book[field]));
}

function getBooks(req, res) {
    let books = bookModel.getAllBooks();

    if (req.query.genre !== undefined) {
        books = books.filter((book) => book.genre === req.query.genre);
    }

    if (req.query.year !== undefined) {
        const year = Number(req.query.year);
        if (!Number.isInteger(year)) {
            return res.status(400).json({ error: 'Query parameter "year" must be an integer' });
        }
        books = books.filter((book) => book.year === year);
    }

    return res.json(books);
}

function getBookById(req, res) {
    const book = bookModel.getBookById(Number(req.params.id));
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    return res.json(book);
}

function createBook(req, res) {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const missingFields = editableFields.filter(
        (field) => !Object.prototype.hasOwnProperty.call(body, field)
    );
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            fields: missingFields
        });
    }

    const invalidFields = getInvalidFields(body);
    if (invalidFields.length > 0) {
        return res.status(400).json({
            error: 'Invalid field values',
            fields: invalidFields
        });
    }

    if (!authorModel.getAuthorById(body.authorId)) {
        return res.status(400).json({ error: 'Author not found' });
    }

    const book = bookModel.createBook({
        title: body.title.trim(),
        authorId: body.authorId,
        genre: body.genre.trim(),
        year: body.year
    });

    return res.status(201).json(book);
}

function updateBook(req, res) {
    const id = Number(req.params.id);
    const currentBook = bookModel.getBookById(id);
    if (!currentBook) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const fields = Object.keys(body);
    if (fields.length === 0) {
        return res.status(400).json({ error: 'At least one field is required' });
    }

    const invalidFields = fields.filter(
        (field) => !editableFields.includes(field) || !isValidBookField(field, body[field])
    );
    if (invalidFields.length > 0) {
        return res.status(400).json({
            error: 'Invalid field values',
            fields: invalidFields
        });
    }

    if (
        Object.prototype.hasOwnProperty.call(body, 'authorId') &&
        !authorModel.getAuthorById(body.authorId)
    ) {
        return res.status(400).json({ error: 'Author not found' });
    }

    const updatedBook = bookModel.updateBook(id, body);
    return res.json(updatedBook);
}

function deleteBook(req, res) {
    const deletedBook = bookModel.deleteBook(Number(req.params.id));
    if (!deletedBook) {
        return res.status(404).json({ error: 'Book not found' });
    }

    return res.json(deletedBook);
}

function searchBooks(req, res) {
    const { title } = req.query;
    if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Query parameter "title" is required' });
    }

    return res.json(bookModel.searchBooksByTitle(title.trim()));
}

module.exports = {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks
};
