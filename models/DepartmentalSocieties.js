const mongoose = require('mongoose');

const DepartmentalSocieties = new mongoose.Schema({
    ProposedEntityName:{
        type:String,
        require:true
    },
    EntityDepartment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    EntityInstitute:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Institute"
    },
    EntityCluster:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cluster"
    },
    TypeOfEntity: {
        type: String,
        required: true
    },
    CategoryOfEntity: {
        type: String,
        enum: ['A', 'B', 'C','D'],
        required: true
    },
    ProposedBy: {
        type: String,
        enum:['Student','Faculty'],
        required: true
    },
    proponentName: {
        type: String,
        required: true
    },
    proponentDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
  
    proposedFacultyAdvisor: [
        {
            ProposedFacultyAdvisorName: String,
            ProposedFacultyAdvisorEid: String,
            MobileNumber: String
        }
    ],
    proposedFacultyCoAdvisor: [
        {
            ProposedFacultyCoAdvisorName: String,
            ProposedFacultyCoAdvisorEid: String,
            MobileNumber: String
        }
    ],
    proposedStudentRepresentative: [
        {
            proposedStudentRepresentativeName: String,
            proposedStudentRepresentativeUid: String,
            MobileNumber: String
        }
    ],
    proposedStudentJointRepresentative: [
        {
            proposedStudentRepresentativeName: String,
            proposedStudentRepresentativeUid: String,
            MobileNumber: String
        }
    ],
    ProposedDate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("DepartmentalSocieties", DepartmentalSocieties);