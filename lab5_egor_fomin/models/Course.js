const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'Укажите название курса.' } }
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: 'Количество кредитов должно быть целым числом.' },
            min: { args: [1], msg: 'Количество кредитов должно быть положительным.' }
        }
    },
    semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: 'Семестр должен быть целым числом.' },
            min: { args: [1], msg: 'Семестр должен быть от 1 до 8.' },
            max: { args: [8], msg: 'Семестр должен быть от 1 до 8.' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: { msg: 'Укажите описание курса.' } }
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Teachers', key: 'id' }
    }
}, {
    hooks: {
        beforeValidate(course) {
            for (const field of ['title', 'description']) {
                if (typeof course[field] === 'string') course[field] = course[field].trim();
            }
        }
    }
});

module.exports = Course;
