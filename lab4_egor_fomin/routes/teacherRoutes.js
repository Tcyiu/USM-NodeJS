const express = require('express');
const controller = require('../controllers/teacherController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(controller.getAllTeachers));
router.get('/new', asyncHandler(controller.showCreateForm));
router.post('/', asyncHandler(controller.createTeacher));
router.get('/:id/edit', asyncHandler(controller.showEditForm));
router.post('/:id/edit', asyncHandler(controller.updateTeacher));
router.post('/:id/delete', asyncHandler(controller.deleteTeacher));
router.get('/:id', asyncHandler(controller.getTeacherById));

module.exports = router;
