const  mongoose  = require("mongoose") ;


const Room = new mongoose.Schema({
    id: {
        type: String
    },
    users: [{
        type: String
    }]
});


module.exports = mongoose.model("Rooms",Room);