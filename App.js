require("dotenv").config();
require("express-async-errors");
//express
const express = require("express");
const app = express();

//rest of packages

//database
const connectDB = require("./db/connect");

//routes

//middleware
app.use(express.json()); // so we can access req.body

const port = process.env.PORT || 5000; // PORT variable to be accessed by heroku on deployemnt, local 5000.
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
