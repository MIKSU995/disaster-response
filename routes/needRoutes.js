const express = require('express');
const router = express.Router();
const needController = require('../controllers/needController');

router.get('/', needController.getAllNeeds);
router.post('/', needController.createNeed);

module.exports = router;