const authorModel = require('../models/authorModel');
const bookModel = require('../models/bookModel');

function getAuthors(req, res) {
    return res.json(authorModel.getAllAuthors());
}

function getAuthorById(req, res) {
    const author = authorModel.getAuthorById(Number(req.params.id));
    if (!author) {
        return res.status(404).json({ error: 'Author not found' });
    }

    return res.json(author);
}

function getAuthorBooks(req, res) {
    const authorId = Number(req.params.id);
    const author = authorModel.getAuthorById(authorId);
    if (!author) {
        return res.status(404).json({ error: 'Author not found' });
    }

    return res.json(bookModel.getBooksByAuthorId(authorId));
}

module.exports = {
    getAuthors,
    getAuthorById,
    getAuthorBooks
};
