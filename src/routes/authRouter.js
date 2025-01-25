const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Basic authentication routes
router.route("/api/v1/register").post(authController.signUp);
router.route("/api/v1/login").post(authController.loginUsingPassword);

// Verification based routes
router.route("/api/v1/user/verify").get(authController.verifyEmail);

// Password reset routes
router.route("/api/v1/password/reset/request").post(authController.requestPasswordReset);
router.route("/api/v1/password/reset/:_id").get(authController.resetPasswordPage) // Renders the password reset page
router.route("/api/v1/password/reset/:_id").post(authController.resetPassword) // Handles the password reset and saves the password

// Otp based routes
router.route("/api/v1/login/otp/request").post(authController.requestOtp);
router.route("/api/v1/login/otp/verify").post(authController.loginUsingOtp);

module.exports = router;
