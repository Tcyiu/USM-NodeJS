const express = require('express');
const path = require('path');
const courseRoutes = require('./routes/courseRoutes');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/courses');
});

app.use('/courses', courseRoutes);

app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Страница не найдена',
        requestedUrl: req.originalUrl
    });
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);
    res.status(500).render('error', {
        title: 'Внутренняя ошибка',
        message: 'Произошла внутренняя ошибка приложения. Попробуйте позже.'
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
}

module.exports = app;
