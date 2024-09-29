const express = require('express');
const router = express.Router();
const {listMembersOfEntity,approve} = require('../controllers/member');

router.get('/listMembersOfEntity',listMembersOfEntity);
router.post('/approve',approve);

module.exports = router;