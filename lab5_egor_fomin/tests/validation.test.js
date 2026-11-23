const test = require('node:test');
const assert = require('node:assert/strict');
const { teacherData, courseData } = require('../middleware/validateData');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { registrationRules, collectValidationErrors } = require('../middleware/validation');

test('teacher data is trimmed and email is normalized', () => {
    const result = teacherData({
        name: ' Ivan Ivanov ',
        email: ' IVANOV@example.com ',
        department: ' Informatics ',
        academicDegree: ' Doctor '
    });

    assert.deepEqual(result.errors, []);
    assert.equal(result.data.name, 'Ivan Ivanov');
    assert.equal(result.data.email, 'ivanov@example.com');
});

test('teacher data rejects missing fields and malformed email', () => {
    const result = teacherData({ name: ' ', email: 'not-an-email' });

    assert.equal(result.errors.length, 4);
});

test('course data accepts positive integer credits and semester in range', () => {
    const result = courseData({
        title: ' Node.js ',
        credits: '5',
        semester: '8',
        description: ' Server-side programming ',
        teacherId: '2'
    });

    assert.deepEqual(result.errors, []);
    assert.equal(result.data.title, 'Node.js');
    assert.equal(result.data.credits, 5);
    assert.equal(result.data.semester, 8);
    assert.equal(result.data.teacherId, 2);
});

test('course data rejects invalid credits, semester, and teacher ID', () => {
    const result = courseData({
        title: '',
        credits: '0',
        semester: '9',
        description: '',
        teacherId: 'abc'
    });

    assert.equal(result.errors.length, 5);
});

test('registration validation checks name, email, password and confirmation', async () => {
    const req = {
        body: {
            name: 'A',
            email: 'not-an-email',
            password: 'short',
            confirmPassword: 'different'
        }
    };
    for (const rule of registrationRules) await rule.run(req);
    await new Promise((resolve) => collectValidationErrors(req, {}, resolve));

    assert.equal(req.validationErrors.length, 4);
});

test('authentication middleware redirects guests and protects admin routes', () => {
    const response = {
        statusCode: 200,
        view: null,
        redirectedTo: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        render(view) {
            this.view = view;
            return this;
        },
        redirect(url) {
            this.redirectedTo = url;
            return this;
        }
    };
    const next = () => { response.nextCalled = true; };

    isAuthenticated({ session: {} }, response, next);
    assert.equal(response.redirectedTo, '/login');

    response.redirectedTo = null;
    isAdmin({ session: { user: { role: 'user' } } }, response, next);
    assert.equal(response.statusCode, 403);
    assert.equal(response.view, '403');

    isAdmin({ session: { user: { role: 'admin' } } }, response, next);
    assert.equal(response.nextCalled, true);
});
