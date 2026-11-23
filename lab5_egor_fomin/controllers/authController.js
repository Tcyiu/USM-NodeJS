const bcrypt = require('bcrypt');
const { User } = require('../models');

function renderAuth(res, view, title, errors = [], values = {}, status) {
    return res.status(status || (errors.length ? 400 : 200)).render(`auth/${view}`, {
        title,
        errors,
        values
    });
}

function sessionOperation(session, operation) {
    return new Promise((resolve, reject) => {
        session[operation]((error) => error ? reject(error) : resolve());
    });
}

exports.showRegister = (req, res) => renderAuth(res, 'register', 'Регистрация');

exports.register = async (req, res) => {
    const errors = [...(req.validationErrors || [])];
    if (errors.length) {
        return renderAuth(res, 'register', 'Регистрация', errors, {
            name: req.body.name,
            email: req.body.email
        });
    }

    const email = req.body.email.toLowerCase();
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return renderAuth(res, 'register', 'Регистрация', ['Пользователь с таким email уже зарегистрирован.'], {
            name: req.body.name,
            email
        }, 409);
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
    if (!Number.isInteger(rounds) || rounds < 4 || rounds > 31) {
        throw new Error('BCRYPT_ROUNDS должен быть целым числом от 4 до 31.');
    }
    const password = await bcrypt.hash(req.body.password, rounds);
    try {
        await User.create({
            name: req.body.name,
            email,
            password
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).render('auth/register', {
                title: 'Регистрация',
                errors: ['Пользователь с таким email уже зарегистрирован.'],
                values: { name: req.body.name, email }
            });
        }
        throw error;
    }

    res.redirect('/login?registered=1');
};

exports.showLogin = (req, res) => {
    const message = req.query.registered === '1' ? ['Регистрация завершена. Теперь войдите.'] : [];
    renderAuth(res, 'login', 'Вход', message);
};

exports.login = async (req, res) => {
    const validationErrors = req.validationErrors || [];
    if (validationErrors.length) {
        return renderAuth(res, 'login', 'Вход', validationErrors, { email: req.body.email });
    }

    const user = await User.findOne({ where: { email: req.body.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return renderAuth(res, 'login', 'Вход', ['Неверный email или пароль.'], {
            email: req.body.email
        }, 401);
    }

    await sessionOperation(req.session, 'regenerate');
    user.lastLogin = new Date();
    await user.save();
    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    await sessionOperation(req.session, 'save');
    res.redirect('/profile');
};

exports.logout = async (req, res) => {
    await sessionOperation(req.session, 'destroy');
    res.clearCookie('connect.sid');
    res.redirect('/login');
};

exports.profile = async (req, res) => {
    const user = await User.findByPk(req.session.user.id, {
        attributes: ['id', 'name', 'email', 'role', 'createdAt', 'lastLogin']
    });
    if (!user) {
        await sessionOperation(req.session, 'destroy');
        return res.redirect('/login');
    }
    res.render('profile', { title: 'Профиль', user });
};
