const mongoose = require('mongoose');


const Faculty = new mongoose.Schema({
    name:
    {
        type:String,
        require:true
    },
    department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    eid:{
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
    password:{
        type:String,
        require: true
    }

});


module.exports=mongoose.model("Faculty",Faculty);