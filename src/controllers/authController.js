const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const jwt = require("jsonwebtoken");
const util = require("util");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");

const signJwtToken = (email) => {
  return jwt.sign(
    {
      email,
    },
    process.env.SECRET_KEY
  );
};

exports.signUp = async (req,res) => {
  try {
    const {name,email,password,contact} = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!name || !email || !password || !contact) {
      return res.status(400).json({message:"All fields are required "})
    }
    else if(!emailRegex.test(email)) {
      return res.status(400).json({message:"Invalid email format "})
    }
    const existingUser = await User.findOne({email });
    if (existingUser) {
      return res.status(400).json({message : "User already exists , Please Login"})
    }
    const hashPassword = await bcrypt.hash(password,10);
    const newUser = new User({
      name,
      email,
      contact,
      password:hashPassword
    })
    await newUser.save();
    return res.status(201).json({
      message:"Signed up successfully , Please verify your email id",
      user:newUser,
    })
  }
  catch (e) {
    return res.status(500).json({message:"Internal server error"})
  }
}

exports.loginUsingOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "Otp is required" });
    }
    const otpData = await Otp.findOne({ otp });
    if (!otpData) {
      return res.status(400).json({ message: "Invalid Otp " });
    }
    if (otpData.isUsed) {
      return res.status(403).json({ message: "Otp already used" });
    }
    otpData.isUsed = true;
    await otpData.save();
    const token = signJwtToken(otpData.email);
    return res.status(200).json({
      message: "Otp verified successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

exports.protectRouter = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    let jwtToken;
    if (!token) {
      return res.status(401).json({ message: "No Token Found" });
    }
    if (token && token.startsWith("Bearer ")) {
      jwtToken = token.split(" ")[1];
    }
    const decodedToken = await util.promisify(jwt.verify)(
      jwtToken,
      process.env.SECRET_KEY
    );
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the given token does not exist" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(501).json({ message: error.message });
  }
};
