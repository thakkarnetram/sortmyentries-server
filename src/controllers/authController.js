// Postgres connection import
const connection = require('../utils/postgresConnection')

// Database model imports
const User = require("../models/userModel");
const Otp = require("../models/otpModel");

// Utils for server imports
const emailSender = require("../utils/emailSender");
const otpGenerator = require('./../utils/generateOtp')

// Node library imports
const jwt = require("jsonwebtoken");
const util = require("util");
const bcrypt = require("bcrypt");
const {sign} = require("jsonwebtoken");

/**
 * This function takes the user's email and using a secret key from .env signs a jwt token mapped to the
 * provided email-id
 * @input email
 * */
const signJwtToken = (email) => {
    return jwt.sign(
        {
            email,
        },
        process.env.SECRET_KEY
    );
};

/**
 * Signs up a new user by validating inputs, checking for existing users, and storing the new user in the database.
 *
 * This function performs the following:
 * 1. Checks if all required fields (name, email, password, contact) are provided.
 * 2. Validates the email format using a regular expression.
 * 3. Ensures the contact number is exactly 10 digits.
 * 4. Checks the database to ensure the user is not already registered.
 * 5. Hashes the password using bcrypt for secure storage.
 * 6. Creates a new user object with the validated data and saves it to the database.
 *
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} contact - The user's 10-digit contact number.
 *
 * @returns {Object} - A response object containing a success message and the newly created user.
 */
// TODO need to verify mail sending
exports.signUp = async (req, res) => {
    try {
        const {name, email, password, contact} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name || !email || !password || !contact) {
            return res.status(400).json({message: "All fields are required "})
        } else if (!emailRegex.test(email)) {
            return res.status(400).json({message: "Invalid email format "})
        } else if (contact.length !== 10) {
            return res.status(400).json({message: "Provide a valid contact number"})
        }
        const existingUser = await connection.query(
            `SELECT * FROM users where email = $1`,
            [email]
        )
        if(existingUser.rows.length > 0 ) {
            return res.status(400).json({message:"User exists please Login"})
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const insertQuery = `
            INSERT INTO users (name, email, contact, password, isVerified)
            VALUES ($1, $2, $3, $4, false)
            RETURNING id, name, email, contact, isVerified
        `;
        const result = await connection.query(insertQuery, [
            name,
            email,
            contact,
            hashPassword
        ]);
        await emailSender.verifyEmail(email);
        return res.status(201).json({
            message: "Signed up successfully, please check your email to verify",
            user: result.rows[0],
        });
    } catch (error) {
        return res.status(500).json({message: error})
    }
}

/**
 * Logs in user using email and password
 *
 * This function performs the following:
 * 1. Checks if email & password are provided.
 * 2. Checks if email has correct format.
 * 3. Checks if user exists or not.
 * 4. Checks if the password entered and stored for the user matches or not .
 *
 * @param {string} email - User's email
 * @param {string} password - User's password
 *
 * @returns {Object} - A response object with user info & jwt-token is sent when the login is successful
 * */

// Need to add verification check TODO
exports.loginUsingPassword = async (req, res) => {
    try {
        const {email, password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email && !password) {
            return res.status(400).json({message: "All fields are required"});
        } else if (!emailRegex.test(email)) {
            return res.status(400).json({message: "Email format is not valid"})
        }
        const userResult = await connection.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const user = userResult.rows[0];
        const matchPassword = await bcrypt.compare(password, user.password);
        if (matchPassword) {
            const token = signJwtToken(user.email);
            return res.status(200).json({
                message: "Login Successful",
                token,
                _id: user.id,
                name: user.name,
                email: user.email,
                contact: user.contact
            });
        } else {
            return res.status(401).json({ message: "Invalid password" });
        }
    } catch (error) {
        return res.status(500).json({message: error})
    }
}

/**
 * Sends otp to user's email
 *
 * This function performs the following:
 *
 * 1. Requests user's email
 * 2. Generates an otp using generateRandomNumber function
 * 3. Checks if user has provided email
 * 4. Checks if the email format is valid
 * 5. Creates a newOtp object including the new otp generated , setting isUsed to false and adding the user's email who had requested.
 * 6. Saves the newOtp object to Database
 * 7. Fires the emailSender util to send the otp to user's email.
 *
 * @returns {Object} A response object with a message is returned on successfully sending the otp
 */
exports.requestOtp = async (req, res) => {
    try {
        const {email} = req.body;
        const otp = otpGenerator.generateRandomNumber();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email) {
            return res.status(400).json({message: "Email is required "});
        }
        if (!emailRegex.test(email)) {
            return res.status(403).json({message: "Invalid Email format"});
        }
        await connection.query(
            `INSERT INTO otp (otp, isUsed, email) VALUES ($1, $2, $3)`,
            [otp, false, email]
        );
        await emailSender.sendOtp(email, otp);
        return res
            .status(200)
            .json({message: `Otp Sent , Please check your email ${email}`});
    } catch (error) {
        return res.status(500).json({message: error});
    }
}

/**
 * Logs in a user using the otp sent on their provided email id.
 *
 * This function performs the following:
 * 1. Checks if the otp is provided by the user.
 * 2. Checks if the otp entered by the user exists in the database.
 * 3. Checks if the otp is already used by the user or not.
 * 4. Changes the value of otp.isUsed to true , so it cannot be used multiple times.
 * 5. Saves the otp to the database as its value of isUsed has changed.
 * 6. Calls the signJwtToken function to sign a token using their provided email.
 * @param {string} otp - The user's input of OTP.
 *
 * @returns {Object} - A response object containing a otp verified message and the jwt signed token for further usage
 * */
exports.loginUsingOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        const otpResult = await connection.query(
            `SELECT * FROM otp WHERE email = $1 AND otp = $2`,
            [email, otp]
        );
        if (otpResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        const otpData = otpResult.rows[0];
        if (otpData.isUsed) {
            return res.status(403).json({ message: "OTP already used" });
        }
        await connection.query(
            `UPDATE otp SET isUsed = TRUE WHERE id = $1`,
            [otpData.id]
        );
        const token = signJwtToken(otpData.email);
        return res.status(200).json({
            message: "Otp verified successfully",
            token,
        });
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

/**
 * Verifies the user's email id
 *
 * This function does the following:
 * 1. Checks if the email is provided in the query
 * 2. Checks if the user exists
 * 3. Updates the user's mail id and set isVerified to true
 *
 * @returns {__filename} emailVerified.ejs - Renders an email verified page on success
 * */
exports.verifyEmail = async (req, res) => {
    try {
        const {email} = req.query;
        if (!email) {
            return res.status(400).json({message: "Email Not Provided"});
        }
        const result = await connection.query(
            `UPDATE users SET isVerified = TRUE WHERE email = $1 RETURNING *`,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).render("emailVerified.ejs");
    } catch (error) {
        return res.status(500).json({message: error});
    }
}

/**
 * Generates a password reset link on user's request
 *
 * This function does the following:
 * 1. Checks if the email is provided.
 * 2. Checks if the email provided is valid .
 * 3. Checks if the user with the give email id exists
 * 4. Creating a link with user._id passed as param
 * 5. Sends an email to the user with password reset link provided
 *
 * */
exports.requestPasswordReset = async (req,res) => {
  try{
    const {email} = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!email) {
      return res.status(400).json({message:"Email not provided"});
    } else if (!emailRegex.test(email)) {
      return res.status(400).json({message:"Invalid Email format"})
    }
      const userResult = await connection.query(
          `SELECT * FROM users WHERE email = $1`,
          [email]
      );
      if (userResult.rows.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      const user = userResult.rows[0];
      const link = `${process.env.ROOT_URL}/auth/api/v1/password/reset/${user.id}`;
      await emailSender.resetPasswordEmail(user.email, link);

      return res.status(200).json({
          message: `Password reset link sent to ${email}`,
      });
  }catch (error){
    return res.status(500).json({ message: error });
  }
}

/**
 * Renders the Reset password page for the user
 *
 * This function performs the following:
 * 1. Checks if the user's id exists
 * 2. If the user's id exists it renders the resetPasswordPage
 *
 * @returns {__filename} - Returns the resetPasswordPage.ejs on success and passes user's id as param
 * */
exports.resetPasswordPage = async (req,res) => {
  try{
      const { _id } = req.params;
      const result = await connection.query(
          `SELECT * FROM users WHERE id = $1`,
          [_id]
      );
      if (result.rows.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      return res.render("resetPasswordPage.ejs", { userId: _id });
  }catch (error){
    return res.status(500).json({ message: error });
  }
}

/**
 * Resets the password for the user
 *
 * This function does the following:
 * 1. Checks if password and confirmPassword is provided by the user
 * 2. Checks if the user exists with the given id
 * 3. Checks if the password and confirmPassword value matches
 * 4. Using bcrypt hashes the new password
 * 5. Saves the new password of the user
 * 6. Returns a resetPasswordSuccess.ejs if the password resets successfully
 *
 * @returns {__filename} - Returns the resetPasswordPageSuccess.ejs on success and updates the password
 * */


exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const { _id } = req.params;

        const result = await connection.query(
            `SELECT * FROM users WHERE id = $1`,
            [_id]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!password || !confirmPassword) {
            return res.status(400).json({ message: "Please enter your new password" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password does not match" });
        }
        const hashedPassword = await bcrypt.hash(confirmPassword, 10);
        await connection.query(
            `UPDATE users SET password = $1 WHERE id = $2`,
            [hashedPassword, _id]
        );
        return res.render("resetPasswordSuccess.ejs");
    } catch (error) {
        return res.render("resetPasswordFail.ejs");
    }
};


/**
 * This is a middleware function which protects the API routes with a token based authorization.
 *
 * This middleware function performs the following:
 *
 * 1. Requests the token from the header authorization.
 * 2. Checks if the token exists.
 * 3. Checks if the token exists and starts with Bearer {token}.
 * 4. Defines a const for decodedToken and verifies the received token with the .env SECRET_KEY.
 * 5. Finds the user's email from database with the given token exists or not.
 * 6. Sends the user object to next function for further usage.
 * */
exports.protectRouter = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        let jwtToken;
        if (!token) {
            return res.status(401).json({ message: "No Token Found" });
        }
        if (token.startsWith("Bearer ")) {
            jwtToken = token.split(" ")[1];
        }
        const decodedToken = await util.promisify(jwt.verify)(
            jwtToken,
            process.env.SECRET_KEY
        );
        const result = await connection.query(
            `SELECT * FROM users WHERE email = $1`,
            [decodedToken.email]
        );
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "The user with the given token does not exist" });
        }
        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

