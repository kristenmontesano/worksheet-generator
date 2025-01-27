const express = require('express');
const router = express.Router();
const worksheetController = require('../controllers/worksheetController');

router.post('/worksheets/generate', worksheetController.generateWorksheet);
router.get('/worksheets', worksheetController.getWorksheets);

module.exports = router; 