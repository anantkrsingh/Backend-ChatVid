const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const meetingSchema = require("../Models/Meeting");

exports.createMeeting = (req, res) => {
  console.log("New Room Creation req...");
  console.log(req.body);
  const { roomId, host, maxParticipant } = req.body;
  meetingSchema.findOne({ roomId: roomId }).exec((error, meeting) => {
    if (meeting) {
      console.log("Duplicate RoomId");
      res.status(201).json({
        status:0,
        meesage: "Please Enter Different Room Id",
      });
    } else {
      const uid = 0;
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 86400;
      const currentTimestamp = Math.floor(Date.now() / 1000); 
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const roomToken = RtcTokenBuilder.buildTokenWithUid(
        process.env.APP_ID,
        process.env.APP_CERTIFICATE,
        roomId,
        uid,
        role,
        privilegeExpiredTs
      );
      console.log("Token Generated", roomToken);
      meetingSchema.createIndexes({ createdAt: 1 ,expireAfterSeconds: 10 } , (error,data)=>{
        console.log(error);
        console.log(data);
      });
      const _meeting = new meetingSchema({
        host,
        roomId,
        roomToken,
        maxParticipant,
        enrolledUsers:0
      });
      _meeting.save((error, room) => {
        if (error) res.status(500).json({ status: 1, message: error });
        else if (room) {
          console.log("Room Created");
          removeRoom(room._id)
          res.status(201).json({
            status: 1,
            message: "Token Generated",
          });
        }
      });
    }
  });
};

exports.getRooms = (req, res) => {
  console.log("Room Req...");
  meetingSchema.find({}).exec((error, rooms) => {
    if (error) res.status(400).json({ status: 0, message: "Error Occurred" });
    res.status(201).json({
      status: 1,
      message: "Success",
      rooms: rooms,
    });
  });
};

exports.getRoom = (req, res) => {
  meetingSchema.findOne({ roomId: req.query.room }).exec((error, room) => {
    if (error) res.status(201).json({ status: 0, message: "Error " });
    else if (room) res.status(201).json({ status: 1, message: room });
    else res.status(201).json({ status: 0, message: "Invalid URL" });
  });
};

const removeRoom  = async (_id) =>{
  await setTimeout(() => {
    meetingSchema.findOneAndDelete({_id:_id}, (error,deleted)=>{
      if(deleted) console.log(deleted)
    })
  }, 10800000);
  
}
