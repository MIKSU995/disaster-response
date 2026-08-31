const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.post('/process', matchController.matchDonation);
router.get('/logs', matchController.getLogs);

module.exports = router;