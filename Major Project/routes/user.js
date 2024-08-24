const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.get("/logout", userController.logout);
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.sighnup));

router
  .route("/login")
  .post(
    saveRedirectUrl, // now the problem with this redirect url is that if the user logs directly by clicking and redirectiong to /loging even after redirecting he will face a page not found problem
    //to understand such problem we must understand the flow and pin point the problems

    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  )

  .get(userController.renderLoginForm);

module.exports = router;
