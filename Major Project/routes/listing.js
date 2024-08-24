const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  // isReviewAuthor,
} = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");
//new & create rout
//GET /listings/new --->  displays a form
//                               |
//                               |
//POST /listings    <----     submit (will send a post req to )
//new
router.get("/new", isLoggedIn, listingController.renderNewForm);
//UPDATE
//GET /listings/:id/edit ---> edit form
//                              |
//                              |
//PUT /listings/:id     <---  submit

//edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

//index route
//create Route
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,

  wrapAsync(listingController.createListing)
);

//read route
//"/listing/:id"
//show route
//DeleteRoute
//updat route
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .delete(
    isLoggedIn,
    // isReviewAuthor,
    isOwner,
    wrapAsync(listingController.destroyListing)
  )
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  );

module.exports = router;
