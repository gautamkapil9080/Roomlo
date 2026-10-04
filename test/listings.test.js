const test = require("node:test");
const assert = require("node:assert/strict");
const Listing = require("../model/listing");
const { cloudinary } = require("../cloudConfig");
const controller = require("../controllers/listings");

test("listing creation saves the validated payload, owner, and uploaded image", async () => {
    const originalSave = Listing.prototype.save;
    let savedListing;
    try {
        Listing.prototype.save = async function save() { savedListing = this; };
        let redirected;
        const req = {
            body: { listing: { title: "Quiet studio", description: "Bright", price: 1200, location: "Pune", Country: "India" } },
            file: { path: "https://cloudinary.test/studio", filename: "roomlo/studio" },
            user: { _id: "507f1f77bcf86cd799439011" },
            flash() {}
        };
        await controller.createRecive(req, { redirect: (url) => { redirected = url; } });
        assert.equal(savedListing.title, "Quiet studio");
        assert.equal(savedListing.owner.toString(), "507f1f77bcf86cd799439011");
        assert.deepEqual(savedListing.image.toObject(), { url: "https://cloudinary.test/studio", filename: "roomlo/studio" });
        assert.equal(redirected, "/listings");
    } finally {
        Listing.prototype.save = originalSave;
    }
});

test("listing update writes only allowed fields and removes its previous image", async () => {
    const originalUpdate = Listing.findByIdAndUpdate;
    const originalDestroy = cloudinary.uploader.destroy;
    let captured;
    const removedImages = [];
    try {
        Listing.findByIdAndUpdate = async (...args) => {
            captured = args;
            return { image: { filename: "old-photo" } };
        };
        cloudinary.uploader.destroy = async (id) => { removedImages.push(id); };
        let redirected;
        const req = {
            params: { id: "listing-id" },
            body: { listing: { title: "New", description: "Text", price: 900, location: "Pune", Country: "India", owner: "attacker" } },
            file: { path: "https://cloudinary.test/new", filename: "new-photo" },
            flash() {}
        };
        await controller.ReciveUpdate(req, { redirect: (url) => { redirected = url; } });
        assert.deepEqual(captured[1].$set, {
            title: "New", description: "Text", price: 900, location: "Pune", Country: "India",
            image: { url: "https://cloudinary.test/new", filename: "new-photo" }
        });
        assert.deepEqual(captured[2], { runValidators: true });
        assert.deepEqual(removedImages, ["old-photo"]);
        assert.equal(redirected, "/listings");
    } finally {
        Listing.findByIdAndUpdate = originalUpdate;
        cloudinary.uploader.destroy = originalDestroy;
    }
});

test("listing deletion removes its Cloudinary image", async () => {
    const originalDelete = Listing.findByIdAndDelete;
    const originalDestroy = cloudinary.uploader.destroy;
    let deletedImage;
    try {
        Listing.findByIdAndDelete = async () => ({ image: { filename: "photo-to-delete" } });
        cloudinary.uploader.destroy = async (id) => { deletedImage = id; };
        let redirected;
        await controller.Delete({ params: { id: "listing-id" }, flash() {} }, { redirect: (url) => { redirected = url; } });
        assert.equal(deletedImage, "photo-to-delete");
        assert.equal(redirected, "/listings");
    } finally {
        Listing.findByIdAndDelete = originalDelete;
        cloudinary.uploader.destroy = originalDestroy;
    }
});
