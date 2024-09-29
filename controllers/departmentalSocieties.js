const DepartmentalSocieties = require('../models/DepartmentalSocieties');
const Department = require('../models/Department');
const Institute=require('../models/Institute');
const Cluster=require('../models/Cluster');
const { createStudentRep } = require('../controllers/studentRepresentative');
const {createFaculty} = require('../controllers/facultyAdvisor');


exports.createDepartmentalSociety = async (req, res) => {
  try {
    const {
      ProposedEntityName,
      entityType,
      EntityInstitute,
      EntityCluster,
      entityCategory,
      ProposedBy,
      proponentName,
      proponentDepartment,
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
    if (
      !ProposedEntityName ||
      !entityType ||
      !entityCategory ||
      !ProposedBy ||
      !proponentName ||
      !EntityDepartment ||
      !EntityInstitute ||
      !EntityCluster ||
      !proponentDepartment ||
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

    const requiredDepartment = await Department.findOne({ name: proponentDepartment });
    const requiredClubDepartment = await Department.findOne({ name: EntityDepartment });
    const requiredClubCluster = await Cluster.findOne({ name: EntityCluster });
    const requiredInstitute = await Institute.findOne({ name: EntityInstitute });

    if (requiredDepartment && requiredClubDepartment && requiredClubCluster && requiredInstitute) {
      const newSociety = new DepartmentalSocieties({
        ProposedEntityName,
        TypeOfEntity:entityType,
        CategoryOfEntity:entityCategory,
        ProposedBy,
        proponentName,
        proponentDepartment: requiredDepartment._id,
        EntityDepartment:requiredClubDepartment._id,
        EntityInstitute:requiredInstitute._id,
        EntityCluster:requiredClubCluster._id,
        
        proposedFacultyAdvisor: [proposedFacultyAdvisor1, proposedFacultyAdvisor2],
        proposedFacultyCoAdvisor: [proposedFacultyCoAdvisor1, proposedFacultyCoAdvisor2],
        proposedStudentRepresentative: [proposedStudentRepresentative1, proposedStudentRepresentative2],
        proposedStudentJointRepresentative: [
          proposedStudentJointRepresentative1,
          proposedStudentJointRepresentative2,
        ],
        ProposedDate,
      });

      const savedEntity = await newSociety.save();
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
        message: 'Departmental Society created successfully',
        Entity: savedEntity,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Invalid department',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error creating Departmental Society: ${error.message}`,
    });
  }
};

exports.findAllDepartmentalSocieties = async (req, res) => {
  try {
    const societies = await DepartmentalSocieties.find().populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster');
    return res.status(200).json({
      success: true,
      message: 'Departmental Societies retrieved successfully',
      Entities:societies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error retrieving Departmental Societies: ${error.message}`,
    });
  }
};

exports.findDepartmentalSocietyById = async (req, res) => {
  try {
    const { id } = req.params;

    const society = await DepartmentalSocieties.findById(id).populate('proponentDepartment');

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Departmental Society not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Departmental Society retrieved successfully',
      society,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error retrieving Departmental Society: ${error.message}`,
    });
  }
};

exports.updateDepartmentalSocietyById = async (req, res) => {
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

    if (
      !ProposedEntityName ||
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

    const updatedSociety = await DepartmentalSocieties.findByIdAndUpdate(
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

    if (!updatedSociety) {
      return res.status(404).json({
        success: false,
        message: 'Departmental Society not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Departmental Society updated successfully',
      Entity: updatedSociety,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating Departmental Society: ${error.message}`,
    });
  }
};

exports.deleteDepartmentalSocietyById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSociety = await DepartmentalSocieties.findByIdAndDelete(id);

    if (!deletedSociety) {
      return res.status(404).json({
        success: false,
        message: 'Departmental Society not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Departmental Society deleted successfully',
      Entity: deletedSociety,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting Departmental Society: ${error.message}`,
    });
  }
};
