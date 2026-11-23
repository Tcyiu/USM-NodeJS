const test = require('node:test');
const assert = require('node:assert/strict');
const { teacherData, courseData } = require('../middleware/validateData');

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
