const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {reviewSchema}=require("../schemavalidation");
const Listing=require("../model/listing");
const ReviewController=require("../controllers/review");
const {isLogin}=require("../middleware/isAuthenticate");
const validateRequest=require("../middleware/validateRequest");
// For review Route : 

// Validation For Review Schema :
router.get("/:id",isLogin,wrapAsync(async (req,res)=>{
    let{id}=req.params;
    let value=await Listing.findById(id);
    if (!value) throw new ExpressError(404,"Listing not found.");
    value=value.title;
    res.render("listings/review",{value,id});
}));

router.post("/listings/:id/reviews",isLogin,validateRequest(reviewSchema),wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await ReviewController.create({ listingId: id, reviewData: req.body.reviews, authorId: req.user._id });
    req.flash("success","Review added.");
    res.redirect(`/listings/${id}`);

}));

module.exports=router;
