const { Op } = require('sequelize');
const { Course, Teacher } = require('../models');
const { courseData, formatDatabaseErrors } = require('../middleware/validateData');
const logAdminAction = require('../middleware/adminLogger');

const semesters = Array.from({ length: 8 }, (_, index) => index + 1);

function validId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function notFound(req, res) {
    return res.status(404).render('404', {
        title: 'Курс не найден',
        requestedUrl: req.originalUrl
    });
}

function renderForm(res, { title, action, course, teachers, errors = [], submitLabel }) {
    return res.status(errors.length ? 400 : 200).render('courses/form', {
        title,
        action,
        course,
        teachers,
        errors,
        submitLabel
    });
}

exports.getAllCourses = async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const teacherQuery = typeof req.query.teacherId === 'string' ? req.query.teacherId : '';
    const semesterQuery = typeof req.query.semester === 'string' ? req.query.semester : '';
    const errors = [];
    const where = {};

    if (search) where.title = { [Op.iLike]: `%${search}%` };
    if (teacherQuery) {
        const teacherId = validId(teacherQuery);
        if (teacherId) where.teacherId = teacherId;
        else errors.push('Некорректный ID преподавателя в фильтре.');
    }
    if (semesterQuery) {
        const semester = Number(semesterQuery);
        if (Number.isInteger(semester) && semester >= 1 && semester <= 8) where.semester = semester;
        else errors.push('Семестр в фильтре должен быть от 1 до 8.');
    }

    const [courses, teachers] = await Promise.all([
        Course.findAll({
            where,
            include: [{ model: Teacher, as: 'teacher' }],
            order: [['id', 'ASC']]
        }),
        Teacher.findAll({ order: [['name', 'ASC']] })
    ]);

    res.render('courses/index', {
        title: 'Учебные курсы',
        courses,
        teachers,
        search,
        teacherId: teacherQuery,
        semester: semesterQuery,
        semesters,
        errors
    });
};

exports.showCreateForm = async (req, res) => {
    const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });
    renderForm(res, {
        title: 'Добавить курс',
        action: '/courses',
        course: {},
        teachers,
        submitLabel: 'Добавить курс'
    });
};

exports.createCourse = async (req, res) => {
    const { data, errors: dataErrors } = courseData(req.body);
    const errors = [...new Set([...(req.validationErrors || []), ...dataErrors])];
    const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });
    if (errors.length) {
        return renderForm(res, {
            title: 'Добавить курс',
            action: '/courses',
            course: req.body,
            teachers,
            errors,
            submitLabel: 'Добавить курс'
        });
    }

    const teacher = await Teacher.findByPk(data.teacherId);
    if (!teacher) {
        return renderForm(res, {
            title: 'Добавить курс',
            action: '/courses',
            course: req.body,
            teachers,
            errors: ['Выбранный преподаватель не найден.'],
            submitLabel: 'Добавить курс'
        });
    }

    try {
        const course = await Course.create(data);
        logAdminAction(req, 'CREATE', 'COURSE', course.id);
        req.app.get('io').emit('courseCreated', {
            title: course.title,
            teacherName: teacher.name,
            createdAt: course.createdAt
        });
        res.redirect('/courses');
    } catch (error) {
        const databaseErrors = formatDatabaseErrors(error);
        if (!databaseErrors) throw error;
        renderForm(res, {
            title: 'Добавить курс',
            action: '/courses',
            course: req.body,
            teachers,
            errors: databaseErrors,
            submitLabel: 'Добавить курс'
        });
    }
};

exports.getCourseById = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const course = await Course.findByPk(id, {
        include: [{ model: Teacher, as: 'teacher' }]
    });
    if (!course) return notFound(req, res);

    res.render('courses/details', { title: course.title, course });
};

exports.showEditForm = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const [course, teachers] = await Promise.all([
        Course.findByPk(id),
        Teacher.findAll({ order: [['name', 'ASC']] })
    ]);
    if (!course) return notFound(req, res);

    renderForm(res, {
        title: 'Редактировать курс',
        action: `/courses/${id}/edit`,
        course,
        teachers,
        submitLabel: 'Сохранить изменения'
    });
};

exports.updateCourse = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const course = await Course.findByPk(id);
    if (!course) return notFound(req, res);

    const { data, errors: dataErrors } = courseData(req.body);
    const errors = [...new Set([...(req.validationErrors || []), ...dataErrors])];
    const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });
    if (!errors.length && !(await Teacher.findByPk(data.teacherId))) {
        errors.push('Выбранный преподаватель не найден.');
    }
    if (errors.length) {
        return renderForm(res, {
            title: 'Редактировать курс',
            action: `/courses/${id}/edit`,
            course: { ...req.body, id },
            teachers,
            errors,
            submitLabel: 'Сохранить изменения'
        });
    }

    try {
        await course.update(data);
        logAdminAction(req, 'UPDATE', 'COURSE', course.id);
        res.redirect(`/courses/${id}`);
    } catch (error) {
        const databaseErrors = formatDatabaseErrors(error);
        if (!databaseErrors) throw error;
        renderForm(res, {
            title: 'Редактировать курс',
            action: `/courses/${id}/edit`,
            course: { ...req.body, id },
            teachers,
            errors: databaseErrors,
            submitLabel: 'Сохранить изменения'
        });
    }
};

exports.deleteCourse = async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return notFound(req, res);
    const course = await Course.findByPk(id);
    if (!course) return notFound(req, res);
    await course.destroy();
    logAdminAction(req, 'DELETE', 'COURSE', course.id);
    res.redirect('/courses');
};
