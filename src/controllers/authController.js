const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const jwt = require("jsonwebtoken");
const util = require("util");
const { sign } = require("jsonwebtoken");

exports.signJwtToken = (email) => {
  return jwt.sign(
    {
      email,
    },
    process.env.SECRET_KEY
  );
};

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
  } catch (error) {
    return res.status(501).json({ message: error });
  }
};

exports.protectRouter = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    let jwtToken;
    // If no token is provided
    if (!token) {
      return res.status(401).json({ message: "No Token Found" });
    }
    if (token && token.startsWith("Bearer ")) {
      jwtToken = token.split(" ")[1];
    }
    // Validate and decode the token
    const decodedToken = await util.promisify(jwt.verify)(
      jwtToken,
      process.env.SECRET_KEY
    );

    // Check if user exists
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the given token does not exist" });
    }

    // Attach the user information to the request object for later use
    req.user = user;
    next();
  } catch (error) {
    res.status(501).json({ message: error.message });
  }
};
