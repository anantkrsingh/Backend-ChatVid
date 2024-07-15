const Room = require('../Models/Room')
const { generateUsername } = require("unique-username-generator");



exports.getRoom = async (req, res) => {
    try {

        const username = generateUsername(" ", 0, 15);
        const _room = new Room({
            id: username,
            users: []
        })

        await _room.save((error, data) => {
            if (error) return res.status(400).json({ status: 1, message: "Error Occurred While Creating Room" })
            else return res.status(201).json({ status: 0, data })
        })
    } catch (e) {
        return res.status(400).json({ status: 0, message: "Internal Error Occurred" })
    }
}

exports.updateRoom = async (req,res) =>{
    try{

    }catch(e){
        
    }
}