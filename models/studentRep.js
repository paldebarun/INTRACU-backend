const mongoose = require('mongoose');


const StudentRep = new mongoose.Schema({
    name:
    {
        type:String,
        require:true
    },
    department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    uid:{
        type: String,
        require: true
    },
    phone:{
        type: Number,
        require: true
    },
    institute:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Institute"
    },
    cluster:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cluster"
    },
    club:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club"
    },
    community:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Communities"
    },
    password:{
        type:String,
        require: true
    }

});


module.exports=mongoose.model("StudentRep",StudentRep);