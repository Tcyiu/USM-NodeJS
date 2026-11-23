const express = require('express');
const controller = require('../controllers/teacherController');
const asyncHandler = require('../middleware/asyncHandler');
const { isAdmin } = require('../middleware/auth');
const { teacherRules, collectValidationErrors } = require('../middleware/validation');

const router = express.Router();
router.get('/', asyncHandler(controller.getAllTeachers));
router.get('/new', isAdmin, asyncHandler(controller.showCreateForm));
router.post('/', isAdmin, teacherRules, collectValidationErrors, asyncHandler(controller.createTeacher));
router.get('/:id/edit', isAdmin, asyncHandler(controller.showEditForm));
router.post('/:id/edit', isAdmin, teacherRules, collectValidationErrors, asyncHandler(controller.updateTeacher));
router.post('/:id/delete', isAdmin, asyncHandler(controller.deleteTeacher));
router.get('/:id', asyncHandler(controller.getTeacherById));

module.exports = router;
