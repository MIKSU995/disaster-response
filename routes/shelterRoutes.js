const express = require('express');
const router = express.Router();
const shelterController = require('../controllers/shelterController');

router.get('/', shelterController.getAllShelters);
router.post('/', shelterController.createShelter);
router.delete('/:id', shelterController.deleteShelter);

module.exports = router;