const Member = require("../models/Member");

exports.listMembersOfEntity = async (req, res) => {
    try {
      const { entityRef } = req.query;
  
      const response = await Member.find({ entityRef: entityRef ,approval:false});
  
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
    
        const response = await Member.findByIdAndUpdate(memberId,
            {approval:true}
        );
        
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