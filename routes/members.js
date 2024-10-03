const express = require('express');
const router = express.Router();

const {listMembersOfEntity,approve,reject,listMembersOfEntityApproved,memberCount} = require('../controllers/member');

router.get('/listMembersOfEntity',listMembersOfEntity);
router.post('/approve',approve);
router.get('/listMembersOfEntityApproved',listMembersOfEntityApproved,memberCount);
router.post('/reject',reject);
router.get('/member-count',memberCount);


module.exports = router;