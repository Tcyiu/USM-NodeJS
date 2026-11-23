const { fn, col } = require('sequelize');
const { Teacher, Course } = require('../models');

exports.getStatistics = async (req, res) => {
    const [teacherCount, courseCount, semesterRows, teachers] = await Promise.all([
        Teacher.count(),
        Course.count(),
        Course.findAll({
            attributes: ['semester', [fn('COUNT', col('id')), 'courseCount']],
            group: ['semester'],
            order: [['semester', 'ASC']],
            raw: true
        }),
        Teacher.findAll({
            attributes: ['id', 'name', [fn('COUNT', col('courses.id')), 'courseCount']],
            include: [{ model: Course, as: 'courses', attributes: [], required: false }],
            group: ['Teacher.id'],
            order: [[fn('COUNT', col('courses.id')), 'DESC'], ['name', 'ASC']]
        })
    ]);

    const semesterCounts = Array.from({ length: 8 }, (_, index) => {
        const semester = index + 1;
        const row = semesterRows.find((item) => Number(item.semester) === semester);
        return { semester, count: row ? Number(row.courseCount) : 0 };
    });
    const teacherStatistics = teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        courseCount: Number(teacher.get('courseCount'))
    }));

    res.render('statistics', {
        title: 'Статистика',
        teacherCount,
        courseCount,
        semesterCounts,
        teacherStatistics,
        mostCoursesTeacher: teacherStatistics[0] || null
    });
};
