const express = require("express");
const otpController = require("../controllers/otpController");

const router = express.Router();

router.route("/api/v1/otp").post(otpController.createOtpAndSend);

module.exports = router;
