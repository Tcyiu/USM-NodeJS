const express = require('express');
const controller = require('../controllers/statisticsController');
const asyncHandler = require('../middleware/asyncHandler');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();
router.get('/', isAuthenticated, asyncHandler(controller.getStatistics));

module.exports = router;
