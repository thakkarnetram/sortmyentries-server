require("dotenv").config({ path: `.env` });
const mongoose = require("mongoose");
exports.connectDb = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("Connected to DB");
  } catch (err) {
    console.log(err);
  }
};
