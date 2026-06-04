module.exports.ForEqual= async(req,res,next)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
     if(!listing.owner.equals(req.user._id)){
        req.flash("error","You Don't Have Permission");
        return res.redirect(`/listings/${id}`);
    }
    next();

};

module.exports.currentUser=async(req,res,next)=>{
   res.locals.currUser=req.user;
   next();
};
