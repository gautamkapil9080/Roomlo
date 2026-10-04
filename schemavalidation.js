const Joi = require("joi");

module.exports.ListingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().min(1).required(),
        description: Joi.string().trim().min(1).required(),
        location: Joi.string().trim().min(1).required(),
        Country: Joi.string().trim().min(1).required(),
        price: Joi.number().min(500).required()
    }).required().unknown(false)
}).unknown(false);

module.exports.reviewSchema = Joi.object({
    reviews: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().trim().min(1).max(2000).required()
    }).required().unknown(false)
}).unknown(false);
