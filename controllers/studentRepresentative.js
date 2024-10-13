const StudentRep = require('../models/studentRep');
const bcrypt = require('bcrypt');

exports.createStudentRep = async (req, res, requiredDepartment, requiredCluster, requiredInstitute, savedEntity) => {
  try {
    const {
      proposedStudentRepresentative,
      proposedStudentJointRepresentative
    } = req.body;

    if (!proposedStudentRepresentative || !proposedStudentJointRepresentative) {
      return res.status(400).json({
        success: false,
        message: 'Student representatives are required',
      });
    }

    const reps = [...proposedStudentRepresentative, ...proposedStudentJointRepresentative];

    for (const rep of reps) {
      const { proposedStudentRepresentativeName, proposedStudentRepresentativeUid, MobileNumber } = rep;

      const hashedPassword = await bcrypt.hash(proposedStudentRepresentativeUid, 10);

      const newStudentRep = new StudentRep({
        name:proposedStudentRepresentativeName,
        department: requiredDepartment._id,
        institute: requiredInstitute._id,
        cluster: requiredCluster._id,
        uid:proposedStudentRepresentativeUid,
        phone:MobileNumber,
        club: savedEntity._id,
        password: hashedPassword,
      });

      await newStudentRep.save();
    }

    return{
      success: true,
      message: 'Student representatives created successfully',
    };
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error creating student representatives: ${error.message}`,
    });
  } 
};
