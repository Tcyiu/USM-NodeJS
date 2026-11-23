require('dotenv').config();

const express = require('express');
const path = require('path');
const { sequelize } = require('./models');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const logger = require('./middleware/logger');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/courses'));
app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);
app.use('/statistics', statisticsRoutes);

app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Страница не найдена',
        requestedUrl: req.originalUrl
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    console.error('Ошибка обработки запроса:', error);
    res.status(500).render('error', {
        title: 'Внутренняя ошибка',
        message: 'Не удалось обработать запрос. Проверьте данные и подключение к базе данных.'
    });
});

async function start() {
    try {
        const requiredVariables = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
        const missingVariables = requiredVariables.filter((name) => !process.env[name]);
        if (missingVariables.length) {
            throw new Error(`Не заданы переменные окружения: ${missingVariables.join(', ')}. Создайте файл .env по образцу .env.example.`);
        }

        await sequelize.authenticate();
        console.log('Database connection established');
        await sequelize.sync();
        console.log('Таблицы базы данных готовы');
        app.listen(PORT, () => {
            console.log(`Сервер запущен: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Не удалось подключиться к PostgreSQL или подготовить таблицы.');
        console.error(error.message);
        console.error('Проверьте PostgreSQL, базу данных и значения в файле .env.');
        process.exitCode = 1;
    }
}

if (require.main === module) start();

module.exports = { app, start };
