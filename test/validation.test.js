const test = require("node:test");
const assert = require("node:assert/strict");
const { ListingSchema, reviewSchema } = require("../schemavalidation");
const validateRequest = require("../middleware/validateRequest");
const requireListingImage = require("../middleware/requireListingImage");
const ExpressError = require("../utils/ExpressError");
const requireConfiguration = require("../utils/configuration");
const uploadPolicy = require("../utils/listingUploadPolicy");
const buildListingSearch = require("../utils/listingSearch");
const getErrorResponse = require("../utils/errorResponse");

const validListing = {
    listing: {
        title: "Quiet studio",
        description: "A bright studio near the park.",
        location: "Pune",
        Country: "India",
        price: 1200
    }
};

function runMiddleware(middleware, req = {}) {
    let nextError;
    let nextCalled = false;
    middleware(req, {}, (error) => {
        nextCalled = true;
        nextError = error;
    });
    return { nextCalled, nextError };
}

test("listing validation accepts a complete listing and rejects extra fields", () => {
    assert.equal(ListingSchema.validate(validListing).error, undefined);
    assert.ok(ListingSchema.validate({ ...validListing, admin: true }).error);
});

test("shared request middleware returns useful 400 validation errors", () => {
    const result = runMiddleware(validateRequest(ListingSchema), { body: { listing: { title: "" } } });
    assert.ok(result.nextError instanceof ExpressError);
    assert.equal(result.nextError.statusCode, 400);
    assert.match(result.nextError.message, /title/i);
});

test("review schema constrains numeric ratings to one through five", () => {
    assert.equal(reviewSchema.validate({ reviews: { rating: 5, comment: "Lovely stay" } }).error, undefined);
    assert.ok(reviewSchema.validate({ reviews: { rating: 6, comment: "Lovely stay" } }).error);
    assert.ok(reviewSchema.validate({ reviews: { rating: "excellent", comment: "Lovely stay" } }).error);
});

test("missing listing image is reported as a client error", () => {
    const result = runMiddleware(requireListingImage, {});
    assert.equal(result.nextError.statusCode, 400);
    assert.match(result.nextError.message, /upload an image/i);
});

test("startup configuration requires credentials and validates the port", () => {
    const env = {
        ATLASDB_URL: "mongodb://example",
        SESSION_SECRET: "a-long-secret",
        CLOUD_NAME: "cloud",
        CLOUD_API_KEY: "key",
        CLOUD_API_SECRET: "secret",
        PORT: "3001"
    };
    assert.equal(requireConfiguration(env), 3001);
    assert.throws(() => requireConfiguration({ ...env, SESSION_SECRET: "" }), /SESSION_SECRET/);
    assert.throws(() => requireConfiguration({ ...env, PORT: "70000" }), /PORT/);
});

test("upload policy allows supported images and rejects other types", () => {
    assert.equal(uploadPolicy.validateFile({ mimetype: "image/webp" }), null);
    assert.match(uploadPolicy.validateFile({ mimetype: "image/gif" }), /JPG, PNG, or WebP/);
    assert.equal(uploadPolicy.maxFileSize, 5 * 1024 * 1024);
});

test("search builder escapes user input, applies price filters, and selects sorting", () => {
    const criteria = buildListingSearch({ searchValue: "Pune.*", priceMin: "500", priceMax: "2500", sort: "price-asc" });
    assert.equal(criteria.term, "Pune.*");
    assert.equal(criteria.query.$and[0].$or.length, 4);
    assert.equal(criteria.query.$and[0].$or[0].title.$regex, "Pune\\.\\*");
    assert.deepEqual(criteria.query.$and[1].price, { $gte: 500, $lte: 2500 });
    assert.deepEqual(criteria.sortSpec, { price: 1 });
});

test("search builder rejects invalid price ranges", () => {
    assert.throws(() => buildListingSearch({ searchValue: "stay", priceMin: "2500", priceMax: "500" }), /Minimum price/);
    assert.throws(() => buildListingSearch({ searchValue: "stay", priceMin: "free" }), /valid non-negative/);
});

test("search builder returns no query for empty input", () => {
    assert.equal(buildListingSearch({ searchValue: "   " }), null);
});

test("error responses expose client errors but hide internal server messages", () => {
    assert.deepEqual(getErrorResponse(new ExpressError(404, "Not found")), { status: 404, message: "Not found" });
    assert.deepEqual(getErrorResponse(new Error("database password leaked")), {
        status: 500,
        message: "Something went wrong. Please try again."
    });
    assert.equal(getErrorResponse({ code: "LIMIT_FILE_SIZE", message: "Too large" }).status, 413);
});
