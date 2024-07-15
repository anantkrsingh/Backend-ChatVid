const express = require("express");
const { AttachSocket } = require("../Controllers/Socket");

const router = express.Router()


router.get("/attach-socket",AttachSocket)


module.exports = router