const Club = require('../models/club');
const Department = require('../models/Department');
const Institute = require('../models/Institute');
const Cluster = require('../models/Cluster');
const { createStudentRep } = require('../controllers/studentRepresentative');
const {createFaculty} = require('../controllers/facultyAdvisor');
exports.createClub = async (req, res) => {
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
    // Validating all required fields
    if (
      !ProposedEntityName ||
      !entityType ||
      !entityCategory ||
      !ProposedBy ||
      !proponentName ||
      !proponentDepartment ||
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
console.log(EntityDepartment);
console.log(EntityInstitute);
console.log(EntityCluster);
    const requiredDepartment = await Department.findOne({ name: proponentDepartment });
    const requiredClubDepartment = await Department.findOne({ name: EntityDepartment });
    const requiredClubCluster = await Cluster.findOne({ name: EntityCluster });
    const requiredInstitute = await Institute.findOne({ name: EntityInstitute });

    if (requiredDepartment && requiredClubCluster && requiredClubDepartment && requiredInstitute) {
      // Create new club entity
      const newClub = new Club({
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
        proposedStudentJointRepresentative: [proposedStudentJointRepresentative1, proposedStudentJointRepresentative2],
        ProposedDate,
      });

      const savedEntity = await newClub.save();

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
        message: 'Club created successfully along with student representatives',
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
      message: `Error creating club: ${error.message}`,
    });
  }
};




exports.findAllClubs = async (req, res) => {
  try {
    
    const Entity = await Club.find().populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster');

   
    return res.status(200).json({
      success: true,
      message: 'Clubs retrieved successfully',
      Entity,
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: `Error retrieving clubs: ${error.message}`,
    });
  }
};


exports.findClubById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the club ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required',
      });
    }

    const Entity = await Club.findById(id).populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster ');


    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }


    return res.status(200).json({
      success: true,
      message: 'Club retrieved successfully',
      Entity,
    });
  } catch (error) {
  
    return res.status(500).json({
      success: false,
      message: `Error retrieving club: ${error.message}`,
    });
  }
};


exports.updateClubById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ProposedClubName,
      CategoryOfEntity,
      proposedFacultyAdvisor1,
      proposedFacultyAdvisor2,
      proposedFacultyCoAdvisor1,
      proposedFacultyCoAdvisor2,
      proposedStudentRepresentative1,
      proposedStudentRepresentative2,
      proposedStudentJointRepresentative1,
      proposedStudentJointRepresentative2
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Club ID',
      });
    }

    if (!ProposedClubName || !CategoryOfEntity || !proposedFacultyAdvisor1 || !proposedFacultyAdvisor2 || !proposedFacultyCoAdvisor1 || !proposedFacultyCoAdvisor2 || !proposedStudentRepresentative1 || !proposedStudentRepresentative2 || !proposedStudentJointRepresentative1 || !proposedStudentJointRepresentative2 ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      id,
      {
        ProposedClubName,
        CategoryOfEntity,
        proposedFacultyAdvisor: [proposedFacultyAdvisor1, proposedFacultyAdvisor2],
        proposedFacultyCoAdvisor: [proposedFacultyCoAdvisor1, proposedFacultyCoAdvisor2],
        proposedStudentRepresentative: [proposedStudentRepresentative1, proposedStudentRepresentative2],
        proposedStudentJointRepresentative: [proposedStudentJointRepresentative1, proposedStudentJointRepresentative2],
      },
      { new: true, runValidators: true }
    ).populate('proponentDepartment EntityDepartment EntityInstitute EntityCluster ');

    if (!updatedClub) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Club updated successfully',
      Entity: updatedClub,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating club: ${error.message}`,
    });
  }
};



exports.deleteClubById = async (req, res) => {
  try {
    const { id } = req.params;
    
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required',
      });
    }

    const deletedClub = await Club.findByIdAndDelete(id);

  
    if (!deletedClub) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    
    return res.status(200).json({
      success: true,
      message: 'Club deleted successfully',
      Entity: deletedClub,
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: `Error deleting club: ${error.message}`,
    });
  }
};