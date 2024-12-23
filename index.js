const express = require("express");
const bodyParser = require("body-parser");
require("./src/utils/mongoConnection").connectDb();

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRoute = require("./src/routes/authRouter");
const otpRoute = require("./src/routes/otpRouter");
const pingRoute = require("./src/routes/pingRouter");
app.use("/auth", authRoute);
app.use("/", otpRoute);
app.use("/", pingRoute);

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log("Server Fired");
});
