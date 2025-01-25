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
  contact : {
    type : String,
  },
  password:{
    type:String,
  },
  isVerified:{
    type:Boolean
  }
});

const User = mongoose.model("users", UserSchema);
module.exports = User;
