const courseModel = require('../models/courseModel');

function renderNotFound(req, res) {
    return res.status(404).render('404', {
        title: 'Курс не найден',
        requestedUrl: req.originalUrl
    });
}

exports.getAllCourses = (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const semester = typeof req.query.semester === 'string' ? req.query.semester : '';
    const courses = courseModel.getAllCourses({ search, semester });

    res.render('courses/index', {
        title: 'Учебные курсы',
        courses,
        search,
        semester,
        semesters: courseModel.getSemesters()
    });
};

exports.showCreateForm = (req, res) => {
    res.render('courses/create', {
        title: 'Добавить курс',
        course: {},
        errors: []
    });
};

exports.createCourse = (req, res) => {
    courseModel.addCourse(req.body);
    res.redirect('/courses');
};

exports.ensureCourse = (req, res, next) => {
    const course = courseModel.getCourseById(req.params.id);
    if (!course) {
        return renderNotFound(req, res);
    }

    req.course = course;
    next();
};

exports.showEditForm = (req, res) => {
    const course = courseModel.getCourseById(req.params.id);
    if (!course) {
        return renderNotFound(req, res);
    }

    res.render('courses/edit', {
        title: 'Редактировать курс',
        course,
        errors: []
    });
};

exports.updateCourse = (req, res) => {
    courseModel.updateCourse(req.course.id, req.body);
    res.redirect(`/courses/${req.course.id}`);
};

exports.getCourseById = (req, res) => {
    const course = courseModel.getCourseById(req.params.id);
    if (!course) {
        return renderNotFound(req, res);
    }

    res.render('courses/details', {
        title: course.title,
        course
    });
};

exports.deleteCourse = (req, res) => {
    const deleted = courseModel.deleteCourse(req.params.id);
    if (!deleted) {
        return renderNotFound(req, res);
    }

    res.redirect('/courses');
};
