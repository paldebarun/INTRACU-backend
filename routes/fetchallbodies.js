const express = require('express');
const router = express.Router();
const allBodies=require('../controllers/FetchAllBodies');

router.get('/getallbodies', allBodies.getAllbodies);

module.exports = router;