const { Teacher, Course } = require('../models');
const { teacherData, formatDatabaseErrors } = require('../middleware/validateData');

function validId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function notFound(req, res) {
    return res.status(404).render('404', {
        title: 'Преподаватель не найден',
        requestedUrl: req.originalUrl
    });
}

function renderForm(res, { title, action, teacher, errors = [], submitLabel }) {
    return res.status(errors.length ? 422 : 200).render('teachers/form', {
        title,
        action,
        teacher,
        errors,
        submitLabel
    });
}

exports.getAllTeachers = async (req, res) => {
    const teachers = await Teacher.findAll({
        include: [{ model: Course, as: 'courses', attributes: ['id'] }],
        order: [['name', 'ASC']]
    });
    res.render('teachers/index', { title: 'Преподаватели', teachers, errors: [] });
};

exports.showCreateForm = (req, res) => {
    renderForm(res, {
        title: 'Добавить преподавателя',
        action: '/teachers',
        teacher: {},
        submitLabel: 'Добавить преподавателя'
    });
};

exports.createTeacher = async (req, res) => {
    const { data, errors } = teacherData(req.body);
    if (errors.length) {
        return renderForm(res, {
            title: 'Добавить преподавателя',
            action: '/teachers',
            teacher: req.body,
            errors,
            submitLabel: 'Добавить преподавателя'
        });
    }

    try {
        await Teacher.create(data);
        res.redirect('/teachers');
    } catch (error) {
        const databaseErrors = formatDatabaseErrors(error);
        if (!databaseErrors) throw error;
        renderForm(res, {
            title: 'Добавить преподавателя',
            action: '/teachers',
            teacher: req.body,
            errors: databaseErrors,
            submitLabel: 'Добавить преподавателя'
        });
    }
};

exports.getTeacherById = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const teacher = await Teacher.findByPk(id, {
        include: [{ model: Course, as: 'courses' }],
        order: [[{ model: Course, as: 'courses' }, 'title', 'ASC']]
    });
    if (!teacher) return notFound(req, res);

    res.render('teachers/details', { title: teacher.name, teacher });
};

exports.showEditForm = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return notFound(req, res);
    renderForm(res, {
        title: 'Редактировать преподавателя',
        action: `/teachers/${id}/edit`,
        teacher,
        submitLabel: 'Сохранить изменения'
    });
};

exports.updateTeacher = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return notFound(req, res);

    const { data, errors } = teacherData(req.body);
    if (errors.length) {
        return renderForm(res, {
            title: 'Редактировать преподавателя',
            action: `/teachers/${id}/edit`,
            teacher: { ...req.body, id },
            errors,
            submitLabel: 'Сохранить изменения'
        });
    }

    try {
        await teacher.update(data);
        res.redirect(`/teachers/${id}`);
    } catch (error) {
        const databaseErrors = formatDatabaseErrors(error);
        if (!databaseErrors) throw error;
        renderForm(res, {
            title: 'Редактировать преподавателя',
            action: `/teachers/${id}/edit`,
            teacher: { ...req.body, id },
            errors: databaseErrors,
            submitLabel: 'Сохранить изменения'
        });
    }
};

exports.deleteTeacher = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const teacher = await Teacher.findByPk(id, {
        include: [{ model: Course, as: 'courses', attributes: ['id'] }]
    });
    if (!teacher) return notFound(req, res);

    if (teacher.courses.length > 0) {
        const teachers = await Teacher.findAll({
            include: [{ model: Course, as: 'courses', attributes: ['id'] }],
            order: [['name', 'ASC']]
        });
        return res.status(409).render('teachers/index', {
            title: 'Преподаватели',
            teachers,
            errors: ['Невозможно удалить преподавателя, у которого есть курсы.']
        });
    }

    try {
        await teacher.destroy();
        res.redirect('/teachers');
    } catch (error) {
        if (error.name !== 'SequelizeForeignKeyConstraintError') throw error;
        const teachers = await Teacher.findAll({
            include: [{ model: Course, as: 'courses', attributes: ['id'] }],
            order: [['name', 'ASC']]
        });
        res.status(409).render('teachers/index', {
            title: 'Преподаватели',
            teachers,
            errors: ['Невозможно удалить преподавателя, у которого есть курсы.']
        });
    }
};
