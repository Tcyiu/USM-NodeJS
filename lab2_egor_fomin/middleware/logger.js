function pad(value) {
    return String(value).padStart(2, '0');
}

function formatDate(date) {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function logger(req, res, next) {
    console.log(`${req.method} | ${req.originalUrl} | ${formatDate(new Date())}`);
    next();
}

module.exports = logger;
