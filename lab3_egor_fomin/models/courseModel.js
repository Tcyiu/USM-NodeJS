const courses = [
    {
        id: 1,
        title: 'Server-side Programming',
        teacher: 'Ivan Ivanov',
        credits: 5,
        semester: 1,
        description: 'Development of server-side applications using Node.js'
    },
    {
        id: 2,
        title: 'Web Technologies',
        teacher: 'Maria Popescu',
        credits: 4,
        semester: 2,
        description: 'Modern web standards, browser technologies, and responsive interfaces'
    },
    {
        id: 3,
        title: 'Database Systems',
        teacher: 'Andrei Rusu',
        credits: 5,
        semester: 3,
        description: 'Relational database design, SQL, and data management'
    },
    {
        id: 4,
        title: 'Computer Networks',
        teacher: 'Elena Munteanu',
        credits: 4,
        semester: 4,
        description: 'Network protocols, architecture, and communication principles'
    },
    {
        id: 5,
        title: 'Software Engineering',
        teacher: 'Ivan Ivanov',
        credits: 6,
        semester: 5,
        description: 'Methods and practices for designing and maintaining software systems'
    }
];
let nextCourseId = courses.reduce((maxId, course) => Math.max(maxId, course.id), 0) + 1;

exports.getAllCourses = ({ search = '', semester = '' } = {}) => {
    const normalizedSearch = search.toLocaleLowerCase();

    return courses.filter((course) => {
        const matchesSearch = !normalizedSearch
            || course.title.toLocaleLowerCase().includes(normalizedSearch)
            || course.teacher.toLocaleLowerCase().includes(normalizedSearch);
        const matchesSemester = !semester || String(course.semester) === semester;
        return matchesSearch && matchesSemester;
    });
};

exports.getSemesters = () => Array.from({ length: 8 }, (_, index) => index + 1);

exports.getCourseById = (id) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
        return undefined;
    }

    return courses.find((course) => course.id === numericId);
};

exports.addCourse = (courseData) => {
    const course = {
        id: nextCourseId,
        title: courseData.title.trim(),
        teacher: courseData.teacher.trim(),
        credits: Number(courseData.credits),
        semester: Number(courseData.semester),
        description: courseData.description.trim()
    };

    courses.push(course);
    nextCourseId += 1;
    return course;
};

exports.updateCourse = (id, courseData) => {
    const course = exports.getCourseById(id);
    if (!course) {
        return undefined;
    }

    Object.assign(course, {
        title: courseData.title.trim(),
        teacher: courseData.teacher.trim(),
        credits: Number(courseData.credits),
        semester: Number(courseData.semester),
        description: courseData.description.trim()
    });
    return course;
};

exports.deleteCourse = (id) => {
    const course = exports.getCourseById(id);
    if (!course) {
        return false;
    }

    courses.splice(courses.indexOf(course), 1);
    return true;
};
