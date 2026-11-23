module.exports = (error, req, res, next) => {
    if (res.headersSent) return next(error);

    const status = error.status || error.statusCode ||
        (error.name === 'SequelizeUniqueConstraintError' ? 409 :
            error.name === 'SequelizeValidationError' ? 400 : 500);
    const messages = {
        400: 'Переданы некорректные данные.',
        401: 'Для выполнения действия необходимо войти.',
        403: 'У вас недостаточно прав для выполнения этого действия.',
        404: 'Запрошенная страница или запись не найдена.',
        409: 'Запись конфликтует с уже существующими данными.',
        500: 'Не удалось обработать запрос. Попробуйте позже.'
    };

    console.error('Ошибка обработки запроса:', error);
    res.status(status).render('error', {
        title: status === 500 ? 'Внутренняя ошибка' : 'Ошибка запроса',
        message: messages[status] || messages[500]
    });
};
