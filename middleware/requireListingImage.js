const ExpressError = require("../utils/ExpressError");

module.exports = (req, res, next) => {
    if (!req.file) {
        return next(new ExpressError(400, "Please upload an image for the listing."));
    }
    next();
};
