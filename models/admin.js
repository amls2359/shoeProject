const mongoose = require('mongoose');


const adminloginschema = new mongoose.Schema({ 
  
    username:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    }
})

const admin = mongoose.model("admin", adminloginschema)

module.exports = admin;