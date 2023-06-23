const session = require("../Models/Session");
const meetingSchema = require("../Models/Meeting");

exports.enroll = (req, res) => {
  meetingSchema.findOne({ roomId: req.query.room }).exec((error, room) => {
    if (room) {
      meetingSchema.updateOne(
        { roomId: req.query.room },
        { enrolledUsers: room.enrolledUsers + 1 },
        (error, data) => {
          if (data) res.status(201).json({ status: 1, message: data });
        }
      );
    } else {
      res.status(201).json({ status: 0, message: "Internal Error" });
    }
  });
};

exports.enlist = (req, res) => {
  console.log("enlist req...");
  meetingSchema.findOne({ roomId: req.query.room }).exec((error, room) => {
    if (room) {
      if (room.enrolledUsers == 1 || room.enrolledUsers == 0) {
        // meetingSchema.deleteOne({roomId:req.query.room}, (error,data)=>{
        //     if(error) res.status(201).json({status:"Internal Error",message:"Intenal Error"})
        //     else res.status(201).json({status:1,message:data})
        // })
      } else {
        meetingSchema.updateOne(
          { roomId: req.query.room },
          { enrolledUsers: room.enrolledUsers - 1 },
          (error, data) => {
            if (data)
              res.status(201).json({ status: 1, message: "User Enrolled" });
          }
        );
      }
    } else {
      res.status(201).json({ status: 0, message: "Internal Error" });
    }
  });
};

exports.addTimestamp = (req, res) => {
  session.findOne({ uid: req.body.uid }).exec((error, timestamp) => {
    const now = new Date();
    if (timestamp) {
      if (timestamp.lastUpdated != now.getDate()) {
        console.log("New Date");
        session.updateOne(
          { uid: req.body.uid },
          { duration: 0 },
          { lastUpdated: now.getDate() },
          (error, data) => {
            
            if (data) {
              res.status(201).json({ message: data, status: 1 });
            } else
              res.status(200).json({ message: "Error occured", status: 1 });
          }
        );
      } else {
        session.updateOne(
          { uid: req.body.uid },
          { duration: Number(timestamp.duration) + 1 },
          (error, data) => {
            if (data) {
            
                res.status(201).json({ message: data, status: 1 });
            } else
              res.status(200).json({ message: "Error occured", status: 1 });
          }
        );
      }
    } else {
      const _timestamp = new session({
        uid: req.body.uid,
        duration: 1,
        lastUpdated: now.getDate(),
      });
      _timestamp.save((error, message) => {
        if (error) res.status(200).json({ message: "Error", status: 0 });
        else res.status(201).json({ message: message, status: 1 });
      });
    }
  });
};

exports.getTimestamp = (req, res) => {
  session.findOne({ uid: req.query.uid }).exec((error, session) => {
    const date = new Date();
    if (session)
      res.status(200).json({
        status: 1,
        duration: session.duration,
        lastUpdated: session.lastUpdated,
      });
    else
      res
        .status(200)
        .json({ status: 1, duration: 0, lastUpdated: date.getDate() });
  });
};
