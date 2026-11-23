const { body, validationResult } = require('express-validator');

exports.registrationRules = [
    body('name').trim().isLength({ min: 2 }).withMessage('Имя должно содержать минимум два символа.'),
    body('email').trim().normalizeEmail().isEmail().withMessage('Введите корректный email.'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум шесть символов.'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password)
        .withMessage('Пароли не совпадают.')
];

exports.loginRules = [
    body('email').trim().normalizeEmail().isEmail().withMessage('Введите корректный email.'),
    body('password').notEmpty().withMessage('Введите пароль.')
];

exports.teacherRules = [
    body('name').trim().isLength({ min: 2 }).withMessage('Имя должно содержать минимум два символа.'),
    body('email').trim().normalizeEmail().isEmail().withMessage('Введите корректный email.'),
    body('department').trim().notEmpty().withMessage('Укажите кафедру.'),
    body('academicDegree').trim().notEmpty().withMessage('Укажите учёную степень.')
];

exports.courseRules = [
    body('title').trim().notEmpty().withMessage('Укажите название курса.'),
    body('credits').isInt({ min: 1 }).withMessage('Количество кредитов должно быть положительным целым числом.'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Семестр должен быть целым числом от 1 до 8.'),
    body('description').trim().notEmpty().withMessage('Укажите описание курса.'),
    body('teacherId').isInt({ min: 1 }).withMessage('Выберите преподавателя.')
];

exports.collectValidationErrors = (req, res, next) => {
    req.validationErrors = validationResult(req).array().map((error) => error.msg);
    next();
};
