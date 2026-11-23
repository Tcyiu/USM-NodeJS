const express = require('express');
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');
const logger = require('./middleware/logger');
const bookModel = require('./models/bookModel');
const authorModel = require('./models/authorModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);

app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.get('/api/statistics', (req, res) => {
    res.json(bookModel.getStatistics(authorModel.getAllAuthors().length));
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

module.exports = app;
