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
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};

exports.verifyEmail = async (email,token) => {
  let transporter = nodeMailer.createTransport({
    service:"gmail",
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASS,
    },
  });
  const link = ``
}