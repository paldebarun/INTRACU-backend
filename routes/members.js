const express = require('express');
const router = express.Router();
const {listMembersOfEntity,approve,getAllMembers} = require('../controllers/member');

router.get('/listMembersOfEntity',listMembersOfEntity);
router.post('/approve',approve);
router.get('/getAllmembers',getAllMembers);


module.exports = router;