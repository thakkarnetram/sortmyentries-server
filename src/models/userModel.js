const mongoose = require("mongoose");
const shortId = require("shortid");

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortId.generate,
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    requie: true,
  },
});

const User = mongoose.model("users", UserSchema);
module.exports = User;
