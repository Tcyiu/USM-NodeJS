const express = require('express');
const controller = require('../controllers/courseController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(controller.getAllCourses));
router.get('/new', asyncHandler(controller.showCreateForm));
router.post('/', asyncHandler(controller.createCourse));
router.get('/:id/edit', asyncHandler(controller.showEditForm));
router.post('/:id/edit', asyncHandler(controller.updateCourse));
router.post('/:id/delete', asyncHandler(controller.deleteCourse));
router.get('/:id', asyncHandler(controller.getCourseById));

module.exports = router;
