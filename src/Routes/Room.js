const express = require('express');

const { getRoom } = require('../Controllers/Room');

const router =  express.Router();

router.get("/get-room",getRoom);



module.exports = router;