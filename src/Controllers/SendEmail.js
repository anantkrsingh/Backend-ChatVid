const nodemailer = require("nodemailer");

exports.sendEmail = (req, res) => {
  console.log("Start");
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: req.query.email,
    subject: "Verify Your Email",
    text: req.link,
  };

  transport.sendMail(mailOptions, (error, info) => {
    // console.log(error);
    // console.log(info);
    if (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 0, message: "Error Sending Email Please Try Again" });
    } else {
      console.log(info);
      return res.status(201).json({ status: 1, message: "A Verification link has Been Sent To Your Email Address" });
    }
  });
  
};