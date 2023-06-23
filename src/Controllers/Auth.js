const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const user = require("../Models/user");
const Premium = require("../Models/PremiumUser");

exports.signup = (req, res, next) => {
  User.findOne({ email: req.query.email }).exec((error, user) => {
    if (user)
      res.status(201).json({ status: 0, message: "User Already Registered" });
    else {
      const { name, email, phone, password } = req.query;
      const _user = new User({
        name,
        email,
        phone,
        password,
        isVerified: false,
        avatar: "1",
        loginType: "Email & Password",
        isPremium: false,
      });
      _user.save((error, data) => {
        if (error) res.status(500).json({ status: 0, message: error });
        if (data) {
          const token = jwt.sign(
            {
              email: req.query.email,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "59min",
            }
          );
          const link = `https://api.englishspeakinghub.online/api/verify/?token=${token}`;
          console.log(link);
          (req.email = req.query.email), (req.link = link);
          res
            .status(201)
            .json({ status: 1, message: "User Successfully Registered" });
        }
      });
    }
  });
};

exports.googleLogin = (req, res) => {
  console.log("Google SignUP Req...");
  User.findOne({ email: req.query.email }).exec((error, user) => {
    console.log(user);
    console.log(error);
    if (!user) {
      const { name, email, phone, password } = req.query;
      const _user = new User({
        name,
        email,
        phone,
        password,
        isVerified: true,
        avatar: "1",
        loginType: "Google Account",
        isPremium: false,
      });
      _user.save((error, data) => {
        if (error) res.status(500).json({ status: 0, message: error });
        if (data) {
          console.log("Google Login Success");
          res.status(201).json({ status: 1, message: data._id, user: data });
        }
      });
    } else res.status(200).json({ status: 1, message: user._id, user: user });
  });
};

exports.login = (req, res) => {
  console.log("Login Req...");
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (error)
      res.status(400).json({ status: 0, message: "User Not Registered" });
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
        const { name, email } = user;
        res.status(200).json({
          status: 1,
          message: "User Login Success",
          user,
        });
        // if (user.isVerified) {

        // } else
        //   res.status(200).json({
        //     status: 0,
        //     message: "User Not Verified",
        //   });
      } else {
        res
          .status(200)
          .json({ status: 0, message: "Email or Password Incorrect" });
      }
    }
  });
};

exports.getUser = (req, res) => {
  User.findOne({ _id: req.query.user }).exec((error, user) => {
    if (user) res.status(201).json({ status: 1, user });
    else res.status(500).json({ status: 0, message: "Error User" });
  });
};

exports.verify = (req, res) => {
  User.updateOne(
    { email: req.user.email },
    { isVerified: true },
    (error, user) => {
      if (error) res.send("Invalid URL Please Contact Administrator");
      if (user) res.send("Update Success");
    }
  );
};

exports.addToPremium = (req, res) => {
  User.updateOne({ _id: req.body.uid }, { isPremium: true }, (error, user) => {
    if (user) {
      Premium.findOne({ uid: req.body.uid }).exec((error, puser) => {
        if (puser) {
          Premium.updateOne(
            { uid: req.body.uid },
            { validTill: req.body.validTill },
            (error, newUser) => {
              if (newUser)
                res.status(201).json({ status: 1, message: newUser });
              else res.status(200).json({ status: 0, message: error });
            }
          );
        } else {
          const { uid, validTill } = req.body;
          const _puser = new Premium({
            uid,
            validTill,
          });
          _puser.save((error, npuser) => {
            if (error) res.status(200).json({ status: 0, message: error });
            else res.status(201).json({ status: 1, mesaage: npuser });
          });
        }
      });
    } else res.status(200).json({ status: 0, message: error });
  });
};
exports.getPremium = (req, res) => {
  Premium.findOne({ uid: req.query.uid }).exec((error, premium) => {
    if (premium)
      res.status(200).json({ status: 1, validTill: premium.validTill });
    else res.status(201).json({ status: 0, message: "Error" });
  });
};

exports.resendOTP = (req, res, next) => {
  const token = jwt.sign(
    {
      email: req.query.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "59min",
    }
  );
  const link = `https://api.englishspeakinghub.online/api/verify/?token=${token}`;
  console.log(link);
  (req.email = req.query.email), (req.link = link);

  next();
};
