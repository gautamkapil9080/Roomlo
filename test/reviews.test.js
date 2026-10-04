const test = require("node:test");
const assert = require("node:assert/strict");
const Listing = require("../model/listing");
const Review = require("../model/review");
const reviewController = require("../controllers/review");

test("review creation stores the signed-in author and links the listing", async () => {
    const originalFind = Listing.findById;
    const originalReviewSave = Review.prototype.save;
    const listing = { reviews: [], async save() {} };
    let savedReview;
    try {
        Listing.findById = async () => listing;
        Review.prototype.save = async function save() { savedReview = this; };
        await reviewController.create({
            listingId: "listing-id",
            reviewData: { comment: "Great stay", rating: 4 },
            authorId: "507f1f77bcf86cd799439011"
        });
        assert.equal(savedReview.author.toString(), "507f1f77bcf86cd799439011");
        assert.equal(listing.reviews[0], savedReview._id);
    } finally {
        Listing.findById = originalFind;
        Review.prototype.save = originalReviewSave;
    }
});

test("review creation returns 404 for a missing listing", async () => {
    const originalFind = Listing.findById;
    try {
        Listing.findById = async () => null;
        await assert.rejects(
            reviewController.create({ listingId: "missing", reviewData: { rating: 4, comment: "Okay" }, authorId: "author" }),
            (error) => error.statusCode === 404
        );
    } finally {
        Listing.findById = originalFind;
    }
});
