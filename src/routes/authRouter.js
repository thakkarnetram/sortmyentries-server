const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Basic authentication routes
router.route("/api/v1/register").post(authController.signUp);
router.route("/api/v1/login").post(authController.loginUsingPassword);

// Otp based routes
router.route("/api/v1/login/otp/request").post(authController.requestOtp);
router.route("/api/v1/login/otp/verify").post(authController.loginUsingOtp);

module.exports = router;
