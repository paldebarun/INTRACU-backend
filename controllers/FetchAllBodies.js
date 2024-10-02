const Club = require('../models/club');
const Communities = require('../models/Communities');
const DepartmentalSocieties = require('../models/DepartmentalSocieties');
const ProfessionalSocieties = require('../models/ProfessionalSocieties');


exports.getAllbodies=async (req,res)=>{
    try{
      
        const clubs=await Club.find();

        const communities=await Communities.find();

        const deptsocieties=await DepartmentalSocieties.find();

        const profsocieties=await ProfessionalSocieties.find();


        return res.status(200).json({
            totalBodiesNumber:clubs.length+communities.length+deptsocieties.length+profsocieties.length,
            success:true
        });


    }
    catch(error){
    
        console.log("error : ",error);
        return res.status(400).json({
            success:false,
            message:`error : ${error}`
        })

    }
}
