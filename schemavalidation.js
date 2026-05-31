// Requiring the JOI 
const Joi = require('joi');
module.exports.ListingSchema=Joi.object({
    listing:Joi.object({
    title:Joi.string().required(),
    description:Joi.string().required(),
    location:Joi.string().required(),
    Country:Joi.string().required(),
    price:Joi.number().required().min(500),
    }).required()
})

module.exports.reviewSchema=Joi.object({
    reviews:Joi.object({
        rating:Joi.string().required(),
        comment:Joi.string().required()
    }).required()
})

