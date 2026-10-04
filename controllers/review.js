const Listing = require("../model/listing");
const Review = require("../model/review");
const ExpressError = require("../utils/ExpressError");

module.exports.create = async ({ listingId, reviewData, authorId }) => {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new ExpressError(404, "Listing not found.");

    const review = new Review(reviewData);
    review.author = authorId;
    await review.save();
    listing.reviews.push(review._id);
    await listing.save();
    return listing;
};
