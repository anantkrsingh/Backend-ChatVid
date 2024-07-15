const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const user = require("../Models/user");
const Premium = require("../Models/PremiumUser");



exports.signup = (req, res, next) => {
    User.findOne({ email: req.body.email }).exec((error, user) => {
      if (user)
      return  res.status(201).json({ status: 0, message: "User Already Registered" });
      else {
        const { name, email,  password } = req.body;
        const _user = new User({
          name,
          email,
          password,
          isVerified: false,
          avatar: "1",
          loginType: "Email & Password",
          isPremium: false,
        });
        _user.save((error, data) => {
          if (error) res.status(400).json({ status: 0, message: error });
          if (data) {
            res
              .status(201)
              .json({ status: 1, message: "User Successfully Registered" });
          }
        });
      }
    });
  };


exports.login = (req, res) => {
    console.log("Login Req...");
    User.findOne({ email: req.body.email }).exec((error, user) => {
        if (error)
          return  res.status(400).json({ status: 0, message: "User Not Registered" });
        else if (user) {
            console.log("User Found");
            if (user.loginType == "Google Account") {
                console.log("Google Account");
                res.status(201).json({
                    status: 0,
                    message: "Please Login Through Google Account",
                });
            } else if (user.authenticate(req.body.password)) {
                console.log(user);
                const { _id } = user;
                const token = jwt.sign(
                    {
                        _id: _id,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "24h",
                    }
                );
                res.status(200).json({
                    status: 1,
                    message: "User Login Success",
                    token,
                });
            } else {
                res
                    .status(200)
                    .json({ status: 0, message: "Email or Password Incorrect" });
            }
        } else return res.status(400).json({ status: 0, message: "User Not Registered" });
    });
};

exports.getUser = (req, res) => {
    User.findOne({ _id: req.user._id }).exec((error, user) => {
        if (user) res.status(201).json({ status: 1, user });
        else res.status(500).json({ status: 0, message: "Error User" });
    });
};




