require('dotenv').config();

const express = require('express');
const session = require('express-session');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT) || 3000;
const logDirectory = path.join(__dirname, 'logs');
fs.mkdirSync(logDirectory, { recursive: true });
const requestLog = fs.createWriteStream(path.join(logDirectory, 'requests.log'), { flags: 'a' });
requestLog.on('error', (error) => console.error('Не удалось записать HTTP-журнал:', error.message));
morgan.token('request-date', (req) => req.requestDate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('io', io);

app.use((req, res, next) => {
    req.requestDate = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    next();
});
app.use(logger);
app.use(morgan((tokens, req, res) => {
    return `${tokens.method(req, res)} ${tokens.url(req, res)} | ${tokens.status(req, res)} | ${tokens['response-time'](req, res)} ms | ${tokens['request-date'](req, res)}`;
}, { stream: requestLog }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/courses'));
app.use('/', authRoutes);
app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);
app.use('/statistics', statisticsRoutes);

app.use(notFound);
app.use(errorHandler);

function listen(serverInstance, port) {
    return new Promise((resolve, reject) => {
        const onError = (error) => {
            serverInstance.removeListener('listening', onListening);
            reject(error);
        };
        const onListening = () => {
            serverInstance.removeListener('error', onError);
            resolve();
        };

        serverInstance.once('error', onError);
        serverInstance.once('listening', onListening);
        serverInstance.listen(port);
    });
}

async function start() {
    try {
        const requiredVariables = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'SESSION_SECRET'];
        const missingVariables = requiredVariables.filter((name) => !process.env[name]);
        if (missingVariables.length) {
            throw new Error(`Не заданы переменные окружения: ${missingVariables.join(', ')}. Создайте файл .env по образцу .env.example.`);
        }

        await sequelize.authenticate();
        console.log('Database connection established');
        await sequelize.sync();
        console.log('Таблицы базы данных готовы');
        await listen(server, PORT);
        console.log(`Сервер запущен: http://localhost:${PORT}`);
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.error(`Порт ${PORT} уже занят. Остановите другое приложение на этом порту (Ctrl+C) или задайте другой PORT в .env.`);
        } else {
            console.error('Не удалось подключиться к PostgreSQL или подготовить приложение.');
            console.error(error.message);
            console.error('Проверьте PostgreSQL, базу данных и значения в файле .env.');
        }
        process.exitCode = 1;
    }
}

if (require.main === module) start();

module.exports = { app, server, io, start };
