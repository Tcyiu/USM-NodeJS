const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'Укажите имя.' } }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Пользователь с таким email уже существует.' },
        validate: {
            notEmpty: { msg: 'Укажите email.' },
            isEmail: { msg: 'Введите корректный email.' }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    hooks: {
        beforeValidate(user) {
            if (typeof user.name === 'string') user.name = user.name.trim();
            if (typeof user.email === 'string') user.email = user.email.trim().toLowerCase();
        }
    }
});

module.exports = User;
