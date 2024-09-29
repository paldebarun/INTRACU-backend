const Communities = require('../models/Communities');
const Department = require('../models/Department');
const Institute = require('../models/Institute');
const Cluster = require('../models/Cluster');
const mongoose = require('mongoose');
const { createStudentRep } = require('../controllers/studentRepresentative');
const {createFaculty} = require('../controllers/facultyAdvisor');

exports.createCommunity = async (req, res) => {
  try {
    const {
      ProposedEntityName,
      entityType,
      entityCategory,
      ProposedBy,
      proponentName,
      proponentDepartment,
      EntityInstitute,
      EntityCluster,
      proposedFacultyAdvisor1,
      proposedFacultyAdvisor2,
      proposedFacultyCoAdvisor1,
      proposedFacultyCoAdvisor2,
      proposedStudentRepresentative1,
      proposedStudentRepresentative2,
      proposedStudentJointRepresentative1,
      proposedStudentJointRepresentative2,
      ProposedDate,
    } = req.body;
    const EntityDepartment = proponentDepartment;
    // Check for required fields
    if (
      !ProposedEntityName ||
      !entityType ||
      !entityCategory ||
      !ProposedBy ||
      !proponentName ||
      !proponentDepartment ||
      !EntityDepartment ||
      !EntityInstitute ||
      !EntityCluster ||
      !proposedFacultyAdvisor1 ||
      !proposedFacultyAdvisor2 ||
      !proposedStudentRepresentative1 ||
      !proposedStudentRepresentative2 ||
      !proposedStudentJointRepresentative1 ||
      !proposedStudentJointRepresentative2 ||
      !proposedFacultyCoAdvisor1 ||
      !proposedFacultyCoAdvisor2 ||
      !ProposedDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Fetch related entities from their respective models
    const requiredDepartment = await Department.findOne({ name: proponentDepartment });
    const requiredClubDepartment = await Department.findOne({ name: EntityDepartment });
    const requiredClubCluster = await Cluster.findOne({ name: EntityCluster });
    const requiredInstitute = await Institute.findOne({ name: EntityInstitute });

    // Check if related entities exist
    if (requiredDepartment && requiredClubDepartment && requiredClubCluster && requiredInstitute) {
      const newCommunity = new Communities({
        ProposedEntityName,
        TypeOfEntity:entityType,
        CategoryOfEntity:entityCategory,
        ProposedBy,
        proponentName,
        proponentDepartment: requiredDepartment._id,
        EntityDepartment: requiredClubDepartment._id,
        EntityInstitute: requiredInstitute._id,
        EntityCluster: requiredClubCluster._id,
        proposedFacultyAdvisor: [proposedFacultyAdvisor1, proposedFacultyAdvisor2],
        proposedFacultyCoAdvisor: [proposedFacultyCoAdvisor1, proposedFacultyCoAdvisor2],
        proposedStudentRepresentative: [proposedStudentRepresentative1, proposedStudentRepresentative2],
        proposedStudentJointRepresentative: [
          proposedStudentJointRepresentative1,
          proposedStudentJointRepresentative2,
        ],
        ProposedDate,
      });

      const savedEntity = await newCommunity.save();
      await createStudentRep(
        {
          body: {
            proposedStudentRepresentative: [proposedStudentRepresentative1, proposedStudentRepresentative2],
            proposedStudentJointRepresentative: [proposedStudentJointRepresentative1, proposedStudentJointRepresentative2],
            proponentDepartment,
          },
        },
        res,
        requiredDepartment,
        requiredClubCluster,
        requiredInstitute,
        savedEntity
      );
      await createFaculty(
        {
          body: {
            proposedFacultyAdvisor: [proposedFacultyAdvisor1, proposedFacultyAdvisor2],
            proposedFacultyCoAdvisor: [proposedFacultyCoAdvisor1, proposedFacultyCoAdvisor2],
            proponentDepartment,
          },
        },
        res,
        requiredDepartment,
        requiredClubCluster,
        requiredInstitute,
        savedEntity
      );


      return res.status(201).json({
        success: true,
        message: 'Community created successfully',
        Entity: savedEntity,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Either department, institute, or cluster is invalid',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error creating community: ${error.message}`,
    });
  }
};

exports.findAllCommunities = async (req, res) => {
  try {
    const Entity = await Communities.find().populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster');
    return res.status(200).json({
      success: true,
      message: 'Communities retrieved successfully',
      Entity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error retrieving communities: ${error.message}`,
    });
  }
};

exports.findCommunityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Community ID is required',
      });
    }

    const community = await Communities.findById(id).populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Community retrieved successfully',
      Entity:community,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error retrieving community: ${error.message}`,
    });
  }
};

exports.updateCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ProposedEntityName,
      CategoryOfEntity,
      proposedFacultyAdvisor1,
      proposedFacultyAdvisor2,
      proposedFacultyCoAdvisor1,
      proposedFacultyCoAdvisor2,
      proposedStudentRepresentative1,
      proposedStudentRepresentative2,
      proposedStudentJointRepresentative1,
      proposedStudentJointRepresentative2,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Community ID',
      });
    }

    if (
      !ProposedEntityName ||
      !CategoryOfEntity ||
      !proposedFacultyAdvisor1 ||
      !proposedFacultyAdvisor2 ||
      !proposedFacultyCoAdvisor1 ||
      !proposedFacultyCoAdvisor2 ||
      !proposedStudentRepresentative1 ||
      !proposedStudentRepresentative2 ||
      !proposedStudentJointRepresentative1 ||
      !proposedStudentJointRepresentative2
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const updatedCommunity = await Communities.findByIdAndUpdate(
      id,
      {
        ProposedEntityName,
        CategoryOfEntity,
        proposedFacultyAdvisor: [proposedFacultyAdvisor1, proposedFacultyAdvisor2],
        proposedFacultyCoAdvisor: [proposedFacultyCoAdvisor1, proposedFacultyCoAdvisor2],
        proposedStudentRepresentative: [proposedStudentRepresentative1, proposedStudentRepresentative2],
        proposedStudentJointRepresentative: [
          proposedStudentJointRepresentative1,
          proposedStudentJointRepresentative2,
        ],
      },
      { new: true, runValidators: true }
    ).populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster');

    if (!updatedCommunity) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Community updated successfully',
      Entity: updatedCommunity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating community: ${error.message}`,
    });
  }
};

exports.deleteCommunityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Community ID is required',
      });
    }

    const deletedCommunity = await Communities.findByIdAndDelete(id);

    if (!deletedCommunity) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Community deleted successfully',
      Entity: deletedCommunity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting community: ${error.message}`,
    });
  }
};
