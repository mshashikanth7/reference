const Listing = require("../models/listing");
const Review = require("../models/reviews");

module.exports.createReview = async (req, res) => {
  //now we creat only post route because we are going to see reviews along with the post already
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  console.log(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created");
  // console.log("new review saved");
  // res.send("new review saved");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  req.flash("success", "review  Deleted");
  let { id, reviewId } = req.params;
  let lRes = await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  }); //we are using update because we are going update are by removig a item from existing array and update it
  let rRes = await Review.findByIdAndDelete(reviewId); //we deleated listing form db but we need to delete the id of listing form the reviews array that is present in the listing
  res.redirect(`/listings/${id}`);
};
