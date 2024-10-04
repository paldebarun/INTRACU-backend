const Communities = require("../models/Communities");
const DepartmentalSocieties = require("../models/DepartmentalSocieties");
const Member = require("../models/Member");
const ProfessionalSocieties = require("../models/ProfessionalSocieties");
const Club = require("../models/club");
const { acceptanceMail, rejectionMail } = require("./mail");



exports.listMembersOfEntity = async (req, res) => {
  try {
    const { entityRef } = req.query;

    const response = await Member.find({ entityRef: entityRef});

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Members retrieved successfully',
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


exports.listMembersOfEntityApproved = async (req, res) => {
  try {
    const { entityRef } = req.query;

    const response = await Member.find({ entityRef: entityRef ,approval:true});

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Members retrieved successfully',
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
  
exports.approve = async (req,res)=>{
  try {
      const { memberId } = req.query;
      const member = await Member.findById(memberId);
      const entityRef = member.entityRef;
      const entityType = member.entityType;
      let entity;
      if(entityType=="Club"){
      const club2 = await Club.findById(entityRef);
    
      entity = club2.ProposedEntityName;
     
      }
      else if(entityType=="Communities"){
        const club2 = Communities.findById(entityRef);
      entity = club2.ProposedEntityName;

      }
      else if(entityType=="ProfessionalSocieties"){
        const club2 = ProfessionalSocieties.findById(entityRef);
      entity = club2.ProposedEntityName;
      }
      else{
        const club2 = DepartmentalSocieties.findById(entityRef);
      entity = club2.ProposedEntityName;
      }
      const email = member.email;
      console.log(email);
      const response = await Member.findByIdAndUpdate(memberId,
          {approval:true}
      );
      const mail = await acceptanceMail(email,entity);
      
      return res.status(200).json({
        success: true,
        status: 200,
        message: 'Members approved successfully',
        response,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
}


exports.reject = async (req,res)=>{
  try {
      const { memberId } = req.query;
      const member = await Member.findById(memberId);
      const entityRef = member.entityRef;
      const entityType = member.entityType;
      let entity;
      if(entityType=="Club"){
      const club2 = await Club.findById(entityRef);
    
      entity = club2.ProposedEntityName;
     
      }
      else if(entityType=="Communities"){
        const club2 = Communities.findById(entityRef);
      entity = club2.ProposedEntityName;

      }
      else if(entityType=="ProfessionalSocieties"){
        const club2 = ProfessionalSocieties.findById(entityRef);
      entity = club2.ProposedEntityName;
      }
      else{
        const club2 = DepartmentalSocieties.findById(entityRef);
      entity = club2.ProposedEntityName;
      }
      const email = member.email;
      console.log(email);
      const response = await Member.findByIdAndDelete(memberId);
      const mail = await rejectionMail(email,entity);
      
      return res.status(200).json({
        success: true,
        status: 200,
        message: 'Members rejected successfully',
        response,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
}


exports.getAllMembers = async (req, res) => {
  try {
    const response = await Member.find(); // No filter to get all members

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'All members retrieved successfully',
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

exports.getMemberCount= async(entity)=> {
  try {

    const male = await Member.countDocuments({gender:'male',entityRef:entity});
    const female = await Member.countDocuments({gender:'female',entityRef:entity});
    const other = await Member.countDocuments({Eventtype:'other',entityRef:entity});
  
    return {
      male: male,
      female: female,
      other: other
    };
  } catch (error) {
    console.error('Error fetching member counts:', error);
    return { error: 'An error occurred while fetching member counts' };
  }
}




exports.memberCount = async (req,res)=>{
  try {
    const {entity} = req.query;
    const counts = await getMemberCount(entity);
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entity counts' });
    console.log(error)
  }
}


async function getMemberCount(entity) {
  try {

    const male = await Member.countDocuments({gender:'male',entityRef:entity});
    const female = await Member.countDocuments({gender:'female',entityRef:entity});
    const other = await Member.countDocuments({Eventtype:'other',entityRef:entity});
  
    return {
      male: male,
      female: female,
      other: other
    };
  } catch (error) {
    console.error('Error fetching member counts:', error);
    return { error: 'An error occurred while fetching member counts' };
  }
}