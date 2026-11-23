const express = require('express');
const courseController = require('../controllers/courseController');
const validateCourse = require('../middleware/validateCourse');

const router = express.Router();

router.get('/', courseController.getAllCourses);
router.get('/new', courseController.showCreateForm);
router.post('/', validateCourse, courseController.createCourse);
router.get('/:id/edit', courseController.showEditForm);
router.post('/:id/edit', courseController.ensureCourse, validateCourse, courseController.updateCourse);
router.post('/:id/delete', courseController.deleteCourse);
router.get('/:id', courseController.getCourseById);

module.exports = router;
