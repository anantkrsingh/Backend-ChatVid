const mongoose  = require('mongoose')

const meetingSchema  = new mongoose.Schema({
    host:{
        type:String,
        required:true
    },
    roomId: {
        type:String,
        required:true,
        unique:true
    },
    roomToken: {
        type:String,
        required : true,
    },
    maxParticipant : {
        type: String,
        required: true
    },
    enrolledUsers : {
            type:Number
    },
    enrolledAvatars:{
        type:String
    },
    audioMuted : {
        type: Boolean,
       
    },
    videoMuted : {
        type: Boolean,
        
    }

}, {timestamps:true});


module.exports = mongoose.model('Meetings', meetingSchema)