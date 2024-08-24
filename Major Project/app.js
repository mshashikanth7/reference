if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const { secureHeapUsed } = require("crypto");
const { required } = require("joi");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to Db");
  })
  .catch((err) => {
    console.log("o");
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "mysecreat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expiers: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Middleware to manage user sessions
app.use(session(sessionOptions));

// Middleware to display flash messages (temporary messages that are displayed to the user)
app.use(flash());

// Sessions must be implemented before the following middlewares because authentication info can be stored in the session
app.use(passport.initialize()); // Initialize Passport.js for authentication
app.use(passport.session()); // Middleware to manage user sessions using Passport.js
// We need passport.session() because a web application needs the ability to identify users as they browse from page to page.
// This series of requests and responses, each associated with the same user, is known as a session.

// Use the local strategy for authentication (username and password)
passport.use(new LocalStrategy(User.authenticate()));

// Serialize user information to store in the session
passport.serializeUser(User.serializeUser());

// Deserialize user information from the session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // console.log(res.locals.success);
  next();
});

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "Student@gmail.com",
    username: "delta-student",
  });

  let registerUser = await User.register(fakeUser, "helloworld");
  res.send(registerUser);
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter); //hear the acess of :id is limited to this app.js file only to extend the acess we can
//const router = express.Touter({mergeParams : true}) whiile declaring the router
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port " + port);
});
