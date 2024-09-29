const express = require('express');
const router = express.Router();


const {createEvent,getFlagship,getMonthly,getWeekly,getAllEvents,getAllEventsById,getUnapprovedEvents,eventsCountEntity,approve,getUnapprovedByID,getTotalBudgetByEntity} = require('../controllers/events');


router.post('/events', createEvent);
router.get('/getallEvents',getAllEvents)
router.get('/flagship',getFlagship);
router.get('/monthly',getMonthly);
router.get('/weekly',getWeekly);
router.get('/unapprovedEvents',getUnapprovedEvents);
router.get('/getAllEventsById',getAllEventsById);
router.get('/events-count-entity',eventsCountEntity);
router.get('/getUnapprovedByID',getUnapprovedByID);
router.post('/approve',approve)
router.get('/getTotalBudgetByEntity',getTotalBudgetByEntity);
module.exports= router;
