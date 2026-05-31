const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {ListingSchema,reviewSchema}=require("../schemavalidation");
const Review=require("../model/review");
const Listing=require("../model/listing");
// For review Route : 

// Validation For Review Schema :
const validateReview=(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);

    if(error){

        let errMsg = error.details.map((el)=>{
            return el.message;
        });

        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}


router.get("/",async (req,res)=>{
    let{id}=req.params;
    let value=await Listing.findById(id);
    value=(value.title);
    res.render("listings/review",{value,id});
});

router.post("/reviews",validateReview,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let review = new Review(req.body.reviews);
    await review.save();
    listing.reviews.push(review._id);
    await listing.save();
    res.redirect(`/listings/${id}`);

}));

module.exports=router;