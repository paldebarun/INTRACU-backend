const ProfessionalSocieties = require('../models/ProfessionalSocieties');
const Department = require('../models/Department');
const Institute = require('../models/Institute');
const Cluster = require('../models/Cluster');
const { createStudentRep } = require('../controllers/studentRepresentative');
const {createFaculty} = require('../controllers/facultyAdvisor');
const mongoose = require('mongoose');
exports.createProfessionalSociety = async (req, res) => {
  try {
    const {
      ProposedEntityName,
      entityType,
      entityCategory,
      ProposedBy,
      EntityInstitute,
      EntityCluster,
      proponentName,
      proponentDepartment,
      proposedFacultyAdvisors, 
      proposedFacultyCoAdvisors, 
      proposedStudentRepresentatives,
      proposedStudentJointRepresentatives, 
      ProposedDate,
    } = req.body;

    const EntityDepartment = proponentDepartment;

    if (
      !ProposedEntityName ||
      !entityType ||
      !entityCategory ||
      !ProposedBy ||
      !proponentName ||
      !proponentDepartment ||
      !EntityInstitute ||
      !EntityCluster ||
      !ProposedDate ||
      !Array.isArray(proposedFacultyAdvisors) || proposedFacultyAdvisors.length === 0 ||
      !Array.isArray(proposedFacultyCoAdvisors) || proposedFacultyCoAdvisors.length === 0 ||
      !Array.isArray(proposedStudentRepresentatives) || proposedStudentRepresentatives.length === 0 ||
      !Array.isArray(proposedStudentJointRepresentatives) || proposedStudentJointRepresentatives.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required, including non-empty arrays for faculty and student representatives',
      });
    }

    const requiredDepartment = await Department.findOne({ name: proponentDepartment });
    const requiredClubDepartment = await Department.findOne({ name: EntityDepartment });
    const requiredClubCluster = await Cluster.findOne({ name: EntityCluster });
    const requiredInstitute = await Institute.findOne({ name: EntityInstitute });

    if (requiredDepartment && requiredClubCluster && requiredClubDepartment && requiredInstitute) {
      const newSociety = new ProfessionalSocieties({
        ProposedEntityName,
        TypeOfEntity: entityType,
        CategoryOfEntity: entityCategory,
        ProposedBy,
        proponentName,
        proponentDepartment: requiredDepartment._id,
        EntityDepartment: requiredClubDepartment._id,
        EntityInstitute: requiredInstitute._id,
        EntityCluster: requiredClubCluster._id,
        proposedFacultyAdvisor: proposedFacultyAdvisors, 
        proposedFacultyCoAdvisor: proposedFacultyCoAdvisors,
        proposedStudentRepresentative: proposedStudentRepresentatives,
        proposedStudentJointRepresentative: proposedStudentJointRepresentatives,
        ProposedDate,
      });

      const savedEntity = await newSociety.save();

      await createStudentRep(
        {
          body: {
            proposedStudentRepresentative: proposedStudentRepresentatives,
            proposedStudentJointRepresentative: proposedStudentJointRepresentatives,
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
            proposedFacultyAdvisor: proposedFacultyAdvisors,
            proposedFacultyCoAdvisor: proposedFacultyCoAdvisors,
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
        message: 'Community created successfully along with student representatives and faculty advisors',
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
      message: `Error creating newCommunity: ${error.message}`,
    });
  }
};


exports.findAllProfessionalSocieties = async (req, res) => {
  try {
    // Retrieve all Professional Societies and populate the department reference
    const societies = await ProfessionalSocieties.find().populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster');

    return res.status(200).json({
      success: true,
      message: 'Professional Societies retrieved successfully',
      Entity:societies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error retrieving Professional Societies: ${error.message}`,
    });
  }
};

exports.findProfessionalSocietyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Professional Society ID format',
      });
    }

    // Find the society by ID and populate the department reference
    const society = await ProfessionalSocieties.findById(id).populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster');

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Professional Society not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional Society retrieved successfully',
      Entity:society,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error retrieving Professional Society: ${error.message}`,
    });
  }
};

exports.updateProfessionalSocietyById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ProposedSocietyName,
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

    // Check if all required fields are present
    if (
      !ProposedSocietyName ||
      !CategoryOfEntity ||
      !proposedFacultyAdvisor1 ||
      !proposedFacultyAdvisor2 ||
      !proposedStudentRepresentative1 ||
      !proposedStudentRepresentative2 ||
      !proposedStudentJointRepresentative1 ||
      !proposedStudentJointRepresentative2 ||
      !proposedFacultyCoAdvisor1 ||
      !proposedFacultyCoAdvisor2
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Update the Professional Society by ID
    const updatedSociety = await ProfessionalSocieties.findByIdAndUpdate(
      id,
      {
        ProposedSocietyName,
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

    if (!updatedSociety) {
      return res.status(404).json({
        success: false,
        message: 'Professional Society not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional Society updated successfully',
      Entity: updatedSociety,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating Professional Society: ${error.message}`,
    });
  }
};

exports.deleteProfessionalSocietyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Professional Society ID format',
      });
    }

    // Find and delete the Professional Society by ID
    const deletedSociety = await ProfessionalSocieties.findByIdAndDelete(id);

    if (!deletedSociety) {
      return res.status(404).json({
        success: false,
        message: 'Professional Society not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional Society deleted successfully',
      Entity: deletedSociety,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting Professional Society: ${error.message}`,
    });
  }
};
