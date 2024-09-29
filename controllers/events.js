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
        const { name, entityType, entityName, organizerType, organizerName, date, venue, Eventtype, category ,budget} = req.body;
        const imageUploadResult = await imageUpload(req);
        if (!imageUploadResult.success) {
            return res.status(400).json(imageUploadResult);
        }
        const imageUrl = imageUploadResult.imageUrl;
        let entity;
        if (entityType === "club") {
            entity = await Club.findOne({ ProposedClubName: entityName });
            if (!entity) {
                return res.status(500).json({
                    success: false,
                    message: `Club not found`,
                });
            }
        } else if (entityType === "community") {
            entity = await Communities.findOne({ ProposedCommunityName: entityName });
            if (!entity) {
                return res.status(500).json({
                    success: false,
                    message: `Community not found`,
                });
            }
        } else if (entityType === "department-society") {
            entity = await DepartmentalSocieties.findOne({ ProposedSocietyName: entityName });
            if (!entity) {
                return res.status(500).json({
                    success: false,
                    message: `Department-society not found`,
                });
            }
        } else if (entityType === "professional-society") {
            entity = await ProfessionalSocieties.findOne({ ProposedSocietyName: entityName });
            if (!entity) {
                return res.status(500).json({
                    success: false,
                    message: `Professional-society not found`,
                });
            }
        }

        let organizer;
        if (organizerType === "Cluster") {
            organizer = await Cluster.findOne({ name: organizerName });
            if (!organizer) {
                return res.status(500).json({
                    success: false,
                    message: `Organizer not found`,
                });
            }
        } else if (organizerType === "Department") {
            organizer = await Department.findOne({ name: organizerName });
            if (!organizer) {
                return res.status(500).json({
                    success: false,
                    message: `Organizer not found`,
                });
            }
        } else {
            organizer = await Institute.findOne({ name: organizerName });
            if (!organizer) {
                return res.status(500).json({
                    success: false,
                    message: `Organizer not found`,
                });
            }
        }

        const newEvent = new Event({
            name,
            imageUrl,
            date,
            entity: {
                type: entityType,
                id: entity._id
            },
            organizer: {
                type: organizerType,
                id: organizer._id
            },
            venue,
            Eventtype,
            category,
            budget
        });

        const savedEvent = await newEvent.save();
        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: savedEvent
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error creating event: ${err.message}`,
        });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const allEvents = await Event.find();  // Fetch all events from the database

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
                  // Match unapproved events
            'entity.id': entityRef,
            approval: false      // Match the specific entity ID
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
    