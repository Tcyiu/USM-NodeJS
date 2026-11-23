const express = require('express');
const controller = require('../controllers/statisticsController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(controller.getStatistics));

module.exports = router;
