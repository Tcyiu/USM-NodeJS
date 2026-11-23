function text(value) {
    return typeof value === 'string' ? value.trim() : '';
}

exports.teacherData = (body) => {
    const data = {
        name: text(body.name),
        email: text(body.email).toLowerCase(),
        department: text(body.department),
        academicDegree: text(body.academicDegree)
    };
    const errors = [];

    if (!data.name) errors.push('Укажите имя преподавателя.');
    if (!data.email) errors.push('Укажите email.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Введите корректный email.');
    if (!data.department) errors.push('Укажите кафедру.');
    if (!data.academicDegree) errors.push('Укажите учёную степень.');

    return { data, errors };
};

exports.courseData = (body) => {
    const credits = text(body.credits);
    const semester = text(body.semester);
    const teacherId = text(body.teacherId);
    const data = {
        title: text(body.title),
        credits: Number(credits),
        semester: Number(semester),
        description: text(body.description),
        teacherId: Number(teacherId)
    };
    const errors = [];

    if (!data.title) errors.push('Укажите название курса.');
    if (!credits || !Number.isInteger(data.credits) || data.credits < 1) {
        errors.push('Количество кредитов должно быть положительным целым числом.');
    }
    if (!semester || !Number.isInteger(data.semester) || data.semester < 1 || data.semester > 8) {
        errors.push('Семестр должен быть целым числом от 1 до 8.');
    }
    if (!data.description) errors.push('Укажите описание курса.');
    if (!teacherId || !Number.isInteger(data.teacherId) || data.teacherId < 1) {
        errors.push('Выберите преподавателя.');
    }

    return { data, errors };
};

exports.formatDatabaseErrors = (error) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return ['Преподаватель с таким email уже существует.'];
    }
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
        return error.errors ? error.errors.map((item) => item.message) : ['Указаны недопустимые данные.'];
    }
    return null;
};
