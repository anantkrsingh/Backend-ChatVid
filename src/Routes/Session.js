const express  = require('express');
const {enroll, enlist, addTimestamp, getTimestamp}  = require('../Controllers/Session')



const router = express.Router();

router.get("/enroll",enroll);
router.get("/enlist",enlist);
router.post("/addTimeStamp",addTimestamp);
router.get("/getTimestamp",getTimestamp);
module.exports = router;