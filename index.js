const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("./src/utils/mongoConnection").connectDb();
require("./src/utils/postgresConnection");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

const authRoute = require("./src/routes/authRouter");
const pingRoute = require("./src/routes/pingRouter");
app.use("/auth", authRoute);
app.use("/", pingRoute);

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log("Server Fired");
});
