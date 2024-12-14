const mongoose = require("mongoose");
const shortId = require("shortid");

const UserSellSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortId.generate,
  },
  sellerId: {
    type: String,
    ref: "users",
  },
  eventName: {
    type: String,
    require: true,
  },
  ticketDetails: [
    {
      catergory: {
        type: String,
        require: true,
      },
      quantity: {
        type: Number,
        require: true,
        min: 1,
      },
    },
  ],
  pricePerTicket: {
    type: Number,
    require: true,
  },
});

const UserSell = mongoose.model("user_seller", UserSellSchema);
module.exports = UserSell;
