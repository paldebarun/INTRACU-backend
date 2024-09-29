const mongoose = require('mongoose');



const Club=new mongoose.Schema({
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
    TypeOfEntity:{
     type:String,
     require:true
    },
    CategoryOfEntity:{
        type: String,
        enum: ['A', 'B', 'C','D'],
        required: true
    },
    ProposedBy:{
     type:String,
     enum:['Student','Faculty'],
     require:true
    },
    proponentName:{
        type:String,
        require:true
    },
    proponentDepartment:{
        type:mongoose.Schema.Types.ObjectId,
         ref:"Department"
    },
    
    proposedFacultyAdvisor:[
        {
            ProposedFacultyAdvisorName:String,
            ProposedFacultyAdvisorEid:String,
            MobileNumber:String,
            email : String
        }
    ],
    proposedFacultyCoAdvisor:[
        {
            ProposedFacultyCoAdvisorName:String,
            ProposedFacultyCoAdvisorEid:String,
            MobileNumber:String,
            email : String
        }
    ],
    proposedStudentRepresentative:[
        {
            proposedStudentRepresentativeName:String,
            proposedStudentRepresentativeUid:String,
            MobileNumber:String,
            email : String
        }
    ],
    proposedStudentJointRepresentative:[
        {
            proposedStudentRepresentativeName:String,
            proposedStudentRepresentativeUid:String,
            MobileNumber:String,
            email : String
        }
    ],
    ProposedDate:{
        type:Date,
        require:true
    }

})

module.exports=mongoose.model("Club",Club);