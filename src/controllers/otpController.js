const OtpModel = require("../models/otpModel");
const emailSender = require("../utils/emailSender");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.createOtpAndSend = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOtp();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(403).json({ message: "Invalid Email format" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required " });
    }
    const newOtp = new OtpModel({
      otp: otp,
      isUsed: false,
    });
    await newOtp.save();
    await emailSender.sendOtp(email, otp);
    return res
      .status(200)
      .json({ message: `Otp Sent , Please check your email ${email}` });
  } catch (error) {
    return res.status(500).json({ message: `Internal Server Error ${error}` });
  }
};
