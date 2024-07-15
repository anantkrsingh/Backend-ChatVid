const express = require('express');

const { login, getUser,signup} = require('../Controllers/AuthV2');
const { verifyJWT } = require('../Middlewares/TokenVerifiers');
const router =  express.Router();

router.get("/get-user",verifyJWT,getUser)
router.post("/login",login)
router.post("/register",signup)

module.exports = router;