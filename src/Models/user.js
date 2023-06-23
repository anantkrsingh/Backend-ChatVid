const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        trim: true,

    },
    avatar:{
        type:String
    },
    hash_password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean
        ,
        required: true
    },
    loginType:{
        type:String,
        required:true
    },
    isPremium: {
        type:Boolean
    }

},{timestamps:true});

user.virtual('password').set(
    function(password){
        this.hash_password = bcrypt.hashSync(password,10)
    }
)

user.methods = {
    authenticate: function(password){
        return bcrypt.compareSync(password, this.hash_password)
    }
}

module.exports = mongoose.model('AudioUser',user);