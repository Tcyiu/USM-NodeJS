const express = require('express');
const controller = require('../controllers/courseController');
const asyncHandler = require('../middleware/asyncHandler');
const { isAdmin } = require('../middleware/auth');
const { courseRules, collectValidationErrors } = require('../middleware/validation');

const router = express.Router();
router.get('/', asyncHandler(controller.getAllCourses));
router.get('/new', isAdmin, asyncHandler(controller.showCreateForm));
router.post('/', isAdmin, courseRules, collectValidationErrors, asyncHandler(controller.createCourse));
router.get('/:id/edit', isAdmin, asyncHandler(controller.showEditForm));
router.post('/:id/edit', isAdmin, courseRules, collectValidationErrors, asyncHandler(controller.updateCourse));
router.post('/:id/delete', isAdmin, asyncHandler(controller.deleteCourse));
router.get('/:id', asyncHandler(controller.getCourseById));

module.exports = router;
