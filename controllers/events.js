const Event = require("../models/event");
const Club = require("../models/club");
const Department = require('../models/Department');
const Cluster = require('../models/Cluster');
const Institute = require('../models/Institute');
const DepartmentalSocieties = require('../models/DepartmentalSocieties');
const ProfessionalSocieties = require('../models/ProfessionalSocieties');
const Communities = require('../models/Communities');
const { imageUpload } = require("./UploadToCloudinary");
const mongoose = require("mongoose");

exports.createEvent = async (req, res) => {
    try {
        const { 
            eventName, 
            entity, 
            organizerCategory, 
            organizerName, 
            startDate, 
            endDate, 
            venue, 
            eventType, 
            eventCategory, 
            organizationLevel, 
            budget 
        } = req.body;

        // Image upload logic (if you have implemented the imageUpload function)
        const imageUploadResult = await imageUpload(req);
        if (!imageUploadResult.success) {
            return res.status(400).json(imageUploadResult);
        }
        const imageUrl = imageUploadResult.imageUrl;

        // Entity validation
        let entityType;
        if (Club.findById(entity)) {
            entityType = "club";
        } else if (Communities.findById(entity)) {
            entityType = "community";//department-society
        } else if (await DepartmentalSocieties.findById(entity)) {
            entityType="department-society";//professional-society
        } else if (await ProfessionalSocieties.findById(entity)) {
            entityType = "professional-society";
        }
        if (!entityType) {
            console.log("entity not found");
            return res.status(500).json({
                success: false,
                message: `Entity not found`,
            });
        }

        // Organizer validation
        let organizer;
        if (organizerCategory === "Cluster") {
            organizer = await Cluster.findOne({ name: organizerName });
        } else if (organizerCategory === "Department") {
            organizer = await Department.findOne({ name: organizerName });
        } else {
            organizer = await Institute.findOne({ name: organizerName });
        }
        if (!organizer) {
            console.log("organizer not found");
            return res.status(500).json({

                success: false,
                message: `Organizer not found`,
            });
        }

        // Create event
        const newEvent = new Event({
            name:eventName,
            imageUrl,
            date: {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            },
            entity: {
                type: entityType,
                id: entity  
            },
            organizer: {
                type: organizerCategory,
                id: organizer._id
            },
            venue,
            Eventtype:eventType,
            category:eventCategory,
            organizationLevel,
            budget
        });

        await newEvent.save();
        return res.status(201).json({ success: true, event: newEvent });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const currentDate = new Date();

        const allEvents = await Event.find({
            'date.startDate': { $gte: currentDate }
        });
        const eventsWithEntityNames = await Promise.all(
            allEvents.map(async event => {
                let entityName = '';

                switch (event.entity.type) {
                    case 'club':
                        const club = await Club.findById(event.entity.id).select('ProposedEntityName');
                        entityName = club ? club.ProposedEntityName : 'Unknown Club';
                        break;
                    case 'community':
                        const community = await Communities.findById(event.entity.id).select('ProposedEntityName');
                        entityName = community ? community.ProposedEntityName : 'Unknown Community';
                        break;
                    case 'department-society':
                        const department = await DepartmentalSocieties.findById(event.entity.id).select('ProposedEntityName');
                        entityName = department ? department.ProposedEntityName : 'Unknown Departmental Society';
                        break;
                    case 'professional-society':
                        const professional = await ProfessionalSocieties.findById(event.entity.id).select('ProposedEntityName');
                        entityName = professional ? professional.ProposedEntityName : 'Unknown Professional Society';
                        break;
                    default:
                        entityName = 'Unknown Entity';
                }
                return {
                    ...event.toObject(),
                    entityName: entityName,
                };
            })
        );

        return res.status(200).json({
            success: true,
            events: eventsWithEntityNames
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving events: ${err.message}`,
        });
    }
};
exports.getAllApprovedEvents = async (req, res) => {
    try {
        const currentDate = new Date();

        const allEvents = await Event.find({
            'date.startDate': { $gte: currentDate }
        , approval: true});
        const eventsWithEntityNames = await Promise.all(
            allEvents.map(async event => {
                let entityName = '';

                switch (event.entity.type) {
                    case 'club':
                        const club = await Club.findById(event.entity.id).select('ProposedEntityName');
                        entityName = club ? club.ProposedEntityName : 'Unknown Club';
                        break;
                    case 'community':
                        const community = await Communities.findById(event.entity.id).select('ProposedEntityName');
                        entityName = community ? community.ProposedEntityName : 'Unknown Community';
                        break;
                    case 'department-society':
                        const department = await DepartmentalSocieties.findById(event.entity.id).select('ProposedEntityName');
                        entityName = department ? department.ProposedEntityName : 'Unknown Departmental Society';
                        break;
                    case 'professional-society':
                        const professional = await ProfessionalSocieties.findById(event.entity.id).select('ProposedEntityName');
                        entityName = professional ? professional.ProposedEntityName : 'Unknown Professional Society';
                        break;
                    default:
                        entityName = 'Unknown Entity';
                }
                return {
                    ...event.toObject(),
                    entityName: entityName,
                };
            })
        );

        return res.status(200).json({
            success: true,
            events: eventsWithEntityNames
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving events: ${err.message}`,
        });
    }
};
exports.getFeaturedEvents = async (req, res) => {
    try {
        const allEvents = await Event.find({featured:true});  // Fetch all events from the database

        return res.status(200).json({
            success: true,
            events: allEvents
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving events: ${err.message}`,
        });
    }
};
exports.getAllEventsById = async (req, res) => {
    try {
        const {entityRef} = req.query;
        console.log(entityRef)
        const allEvents = await Event.find({'entity.id': entityRef });  // Fetch all events from the database
        
        return res.status(200).json({
            success: true,
            events: allEvents 
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving events: ${err.message}`,
        });
    }
};
exports.getUnapprovedByID = async (req, res) => {
    try {
        const { entityRef } = req.query;
        console.log("Entity Ref:", entityRef);

        const allEvents = await Event.find({
                 
            'entity.id': entityRef,
            approval: false     
        });

        return res.status(200).json({
            success: true,
            events: allEvents
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving events: ${err.message}`,
        });
    }
};


exports.approve = async(req,res)=>{
    try {
        const { eventId } = req.query;
    
        const response = await Event.findByIdAndUpdate(eventId,
            {approval:true}
        );
        
        return res.status(200).json({
          success: true,
          status: 200,
          message: 'Event approved successfully',
          response,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          status: 500,
          message: error.message,
        });
}
};
function getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
   
    return { startOfMonth, endOfMonth };
  }
  
exports.getTotalBudgetByEntity = async (req, res) => {
    try {
      const { entityRef } = req.query;
      
      if (!mongoose.Types.ObjectId.isValid(entityRef)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid entity reference',
        });
      }
  
      const { startOfMonth, endOfMonth } = getCurrentMonthRange();
      console.log(startOfMonth);
      console.log(endOfMonth);
      console.log(entityRef);
      const totalBudget = await Event.aggregate([
        {
          $match: {
            'entity.id': new mongoose.Types.ObjectId(entityRef),
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: "$budget" }
          }
        }
      ]);
      console.log(totalBudget);
      return res.status(200).json({
        success: true,
        totalBudget: totalBudget.length > 0 ? totalBudget[0].totalBudget : 0,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: `Error calculating total budget: ${err.message}`,
      });
    }
  };

exports.getMonthly = async (req, res) => {
    try {
        const currentDate = new Date();
        const { category } = req.query;

        const matchStage = { 
            Eventtype: 'monthly',
            date: { $gte: currentDate }  // Only future events
        };

        if (category) {
            matchStage.category = category;  // Filter by category if provided
        }

        const monthlyEvents = await Event.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    dateDifference: {
                        $abs: { $subtract: [{ $toLong: "$date" }, { $toLong: currentDate }] }
                    }
                }
            },
            { $sort: { dateDifference: 1 } },  // Sort by the closest date first
            { $limit: 3 }  // Limit to 3 events
        ]);

        return res.status(200).json({
            success: true,
            events: monthlyEvents
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving monthly events: ${err.message}`,
        });
    }
};

exports.getWeekly = async (req, res) => {
    try {
        const currentDate = new Date();
        const { category } = req.query;

        const matchStage = { 
            Eventtype: 'weekly',
            date: { $gte: currentDate }  // Only future events
        };

        if (category) {
            matchStage.category = category;  // Filter by category if provided
        }

        const weeklyEvents = await Event.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    dateDifference: {
                        $abs: { $subtract: [{ $toLong: "$date" }, { $toLong: currentDate }] }
                    }
                }
            },
            { $sort: { dateDifference: 1 } },  // Sort by the closest date first
            { $limit: 3 }  // Limit to 3 events
        ]);

        return res.status(200).json({
            success: true,
            events: weeklyEvents
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving weekly events: ${err.message}`,
        });
    }
};

exports.getFlagship = async (req, res) => {
    try {
        const currentDate = new Date();
        const { category } = req.query;

        const matchStage = {
            Eventtype: 'flagship',
            date: { $gte: currentDate }  // Only future events
        };

        if (category) {
            matchStage.category = category;  // Filter by category if provided
        }

        const flagshipEvents = await Event.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    dateDifference: {
                        $abs: { $subtract: [{ $toLong: "$date" }, { $toLong: currentDate }] }
                    }
                }
            },
            { $sort: { dateDifference: 1 } },  // Sort by the closest date first
            { $limit: 3 }  // Limit to 3 events
        ]);

        return res.status(200).json({
            success: true,
            events: flagshipEvents
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving flagship events: ${err.message}`,
        });
    }
};

exports.getUnapprovedEvents = async (req, res) => {
    try {
        const unapprovedEvents = await Event.find({ approval: false });  // Query for events with approval set to false

        return res.status(200).json({
            success: true,
            events: unapprovedEvents
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error retrieving unapproved events: ${err.message}`,
        });
    }
};
async function getEventCounts(entityRef) {
    try {
      const weekly = await Event.countDocuments({
        Eventtype: 'weekly',
        'entity.id': entityRef 
      });
  
      const monthly = await Event.countDocuments({
        Eventtype: 'monthly',
        'entity.id': entityRef  
      });
  
      const flagship = await Event.countDocuments({
        Eventtype: 'flagship',
        'entity.id': entityRef  
      });
  
      return {
        weekly: weekly,
        monthly: monthly,
        flagship: flagship
      };
    } catch (error) {
      console.error('Error fetching event counts:', error);
      return { error: 'An error occurred while fetching event counts' };
    }
  }
  exports.eventsCountEntity = async (req, res) => {
    try {
      const { entityRef } = req.query;
      const counts = await getEventCounts(entityRef);
  
      res.status(201).json({
        success: true,
        data: counts
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching events count' });
    }
  };
    
