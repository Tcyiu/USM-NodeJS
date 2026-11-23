module.exports = (req, res, next) => {
    const now = new Date();
    const date = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(now);
    const time = new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).format(now);

    console.log(`${req.method} | ${req.originalUrl} | ${date} ${time}`);
    next();
};
