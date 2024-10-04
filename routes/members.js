const express = require('express');
const router = express.Router();

const {listMembersOfEntity,approve,reject,listMembersOfEntityApproved,memberCount} = require('../controllers/member');
const {inviteMembersByEntity} = require('../controllers/mail');


router.get('/listMembersOfEntity',listMembersOfEntity);
router.post('/approve',approve);
router.get('/listMembersOfEntityApproved',listMembersOfEntityApproved,memberCount);
router.post('/reject',reject);
router.get('/member-count',memberCount);

router.post('/inviteMembersByEntity',inviteMembersByEntity);

module.exports = router;


module.exports = router;