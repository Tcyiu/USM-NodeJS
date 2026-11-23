const sequelize = require('../config/database');
const Teacher = require('./Teacher');
const Course = require('./Course');

Teacher.hasMany(Course, {
    foreignKey: 'teacherId',
    as: 'courses',
    onDelete: 'RESTRICT'
});

Course.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    as: 'teacher',
    onDelete: 'RESTRICT'
});

module.exports = { sequelize, Teacher, Course };
