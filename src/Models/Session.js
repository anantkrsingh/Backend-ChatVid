const mongoose =  require( "mongoose");

const Session = new mongoose.Schema({
    uid:{
        type:String
    },
    duration:{
        type:Number
    },
    lastUpdated:{
        type:Number
    }
})
const session  =  mongoose.model("Sessions",Session)
module.exports = session