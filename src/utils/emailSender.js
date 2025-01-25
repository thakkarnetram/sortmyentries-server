const nodeMailer = require("nodemailer");
exports.sendOtp = async (email, otp) => {
  let transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.GMAIL_ID,
    to: email,
    subject: "Your OTP Code",
    html: `
          <h2>Hi ${email},</h2>
          <h3>Your OTP Code is: <strong>${otp}</strong></h3>
          <p>Please use this code to complete your verification process.</p>
          <h4>Thank you!</h4>
        `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to ", email);
  } catch (error) {
    console.log("Error sending OTP: ", error);
  }
};

exports.verifyEmail = async (email, token) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASS,
    },
  });
  const link = `${process.env.ROOT_URL}/auth/api/v1/email/verify`;
  const mail = process.env.GMAIL_ID;
  const mailOptions = {
    from: process.env.GMAIL_ID,
    to: email,
    subject: "Email Verification",
    generateTextFromHTML: true,
    html: `
      <h2>Hi ${email}</h2>
      <h3>Please Verify your mail </h3>
      <p>Click <a href="${link}?email=${email}">here</a> to verify your email.</p>
      <h4>Thank you . </h4>
      <h5>Contact Developer <a href="mailto:${mail}">${mail}</a> </h5>
      `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Sent email ", email);
  } catch (error) {
    console.log("Error ", error);
  }
};
