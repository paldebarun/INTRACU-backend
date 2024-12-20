const express = require('express');
const router = express.Router();


const {createEvent,getFlagship,getMonthWiseEvents,getFeaturedEvents,getAllApprovedEvents,getMonthly,getWeekly,getAllEvents,getAllEventsById,getUnapprovedEvents,eventsCountEntity,approve,getUnapprovedByID,getTotalBudgetByEntity,getapprovedByID,getAllApprovedButNotfeatured,reject} = require('../controllers/events');


router.post('/events', createEvent);
router.get('/getallEvents',getAllEvents);
router.get('/getAllApprovedEvents',getAllApprovedEvents);
router.get('/flagship',getFlagship);
router.get('/monthly',getMonthly);
router.get('/weekly',getWeekly);
router.get('/featured',getFeaturedEvents);
router.get('/unapprovedEvents',getUnapprovedEvents);
router.get('/getMonthWiseEvents',getMonthWiseEvents);
router.get('/getAllEventsById',getAllEventsById);
router.get('/events-count-entity',eventsCountEntity);
router.get('/getUnapprovedByID',getUnapprovedByID);
router.get('/getapprovedByID',getapprovedByID);
router.post('/approve',approve);
router.post('/reject',reject);
router.get('/getTotalBudgetByEntity',getTotalBudgetByEntity);
router.get('/getAllApprovedButNotfeatured',getAllApprovedButNotfeatured);
module.exports= router;
