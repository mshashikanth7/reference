const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  req.flash("success", "listing Deleted");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    //now to populate the populated user we need to use nested populated
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "listing you requiested for doesnt exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }
  // all the function in the comments can be done by

  const newListing = new Listing(req.body.listing);

  // if (!newListing.title) {
  // throw new ExpressError (400, "Title is missing!");
  // }
  // if (!newListing.description) {
  // throw new ExpressError (400, "Description is missing!");
  // }
  // if (!newListing.location) {
  // throw new ExpressError (400, "Location is missing!");
  // }
  newListing.owner = req.user;
  newListing.image = { url, filename };
  await newListing.save(); //!hear is where listing is saved
  req.flash("success", "new listing created:");
  res.redirect("/listings");
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);

  res.render("listings/new.ejs");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exits!");
    res.redirect("/listing");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_3,w_25");
  console.log(originalImageUrl);
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //it a javascript object that is being deconstructed to get indvisual values which will be passed in new body
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`);
};
