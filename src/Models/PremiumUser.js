const mongoose = require('mongoose')


const Premium = new mongoose.Schema({
    uid:{
        type:String,
        required:true
    },
    validTill:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("Premium Users",Premium)