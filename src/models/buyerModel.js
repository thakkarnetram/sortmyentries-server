const mongoose = require("mongoose");
const shortId = require("shortid");

const UserBuySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortId.generate,
  },
  buyerId: {
    type: String,
    ref: "users",
  },
  eventName: {
    type: String,
    require: true,
  },
});

const UserBuy = mongoose.model("user_buyer", UserBuySchema);
module.exports = UserBuy;
