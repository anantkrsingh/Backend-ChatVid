const express  = require('express');
const { createMeeting, getRooms , getRoom} = require('../Controllers/Generator');
const router = express.Router();



router.post('/create', createMeeting)
router.get('/getRooms', getRooms)
router.get('/get',getRoom)
  
module.exports = router;