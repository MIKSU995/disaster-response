const express = require('express');
const router = express.Router();
const needController = require('../controllers/needController');

router.get('/', needController.getAllNeeds);
router.post('/', needController.createNeed);
router.delete('/:id', needController.deleteNeed);
router.patch('/:id/fulfill', needController.fulfillNeed);

module.exports = router;