require("dotenv").config();

const express = require("express");
const app = express();
const Layouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");

const indexRoutes = require("./routes/index");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(Layouts);
app.use(express.static("public"));

// db connection
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to mongodb successfully !"));

// routes
app.use("/", indexRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
