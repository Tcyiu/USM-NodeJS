const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'Укажите имя преподавателя.' } }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Преподаватель с таким email уже существует.' },
        validate: {
            notEmpty: { msg: 'Укажите email.' },
            isEmail: { msg: 'Введите корректный email.' }
        }
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'Укажите кафедру.' } }
    },
    academicDegree: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'Укажите учёную степень.' } }
    }
}, {
    hooks: {
        beforeValidate(teacher) {
            for (const field of ['name', 'email', 'department', 'academicDegree']) {
                if (typeof teacher[field] === 'string') teacher[field] = teacher[field].trim();
            }
        }
    }
});

module.exports = Teacher;
