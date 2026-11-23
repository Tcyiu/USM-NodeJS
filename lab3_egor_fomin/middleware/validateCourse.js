const courseModel = require('../models/courseModel');

module.exports = (req, res, next) => {
    const values = {
        title: typeof req.body.title === 'string' ? req.body.title.trim() : '',
        teacher: typeof req.body.teacher === 'string' ? req.body.teacher.trim() : '',
        credits: typeof req.body.credits === 'string' ? req.body.credits.trim() : '',
        semester: typeof req.body.semester === 'string' ? req.body.semester.trim() : '',
        description: typeof req.body.description === 'string' ? req.body.description.trim() : ''
    };
    const errors = [];
    const credits = Number(values.credits);
    const semester = Number(values.semester);

    if (!values.title) {
        errors.push('Название дисциплины обязательно');
    }
    if (!values.teacher) {
        errors.push('Преподаватель обязателен');
    }
    if (!values.credits || !Number.isFinite(credits) || credits <= 0) {
        errors.push('Количество кредитов должно быть положительным числом');
    }
    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
        errors.push('Семестр должен находиться в диапазоне от 1 до 8');
    }
    if (!values.description) {
        errors.push('Описание дисциплины обязательно');
    }

    if (errors.length === 0) {
        return next();
    }

    const isEdit = Boolean(req.params.id);
    res.status(400).render(isEdit ? 'courses/edit' : 'courses/create', {
        title: isEdit ? 'Редактировать курс' : 'Добавить курс',
        course: isEdit ? { ...req.course, ...values } : values,
        errors
    });
};
