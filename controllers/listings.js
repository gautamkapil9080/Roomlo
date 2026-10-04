const Listing=require("../model/listing");
const {cloudinary}=require("../cloudConfig");
const ExpressError=require("../utils/ExpressError");

module.exports.index=async(req,res)=>{
    let data = await Listing.find({});
    res.render("listings/index",{data})};
module.exports.createSend=(req,res)=>{
res.render("listings/create");
};

// module.exports.createRecive=(async(req,res,next)=>{
//         let result=ListingSchema.validate(req.body);
//         if(result.error){
//             throw new ExpressError(404,result.error);
//         }
//         const newListing=new Listing(req.body.listing);
//         newListing.owner=req.user._id;
//         await newListing.save();
//         console.log(newListing);
//         req.flash("success","Added New List");
//         res.redirect("/listings");
// });
// controller
module.exports.createRecive=(async(req,res,next)=>{
    const { path: url, filename } = req.file;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","Added New List");
    res.redirect("/listings");
});

module.exports.Showvalue=async(req,res)=>{  // ** To show the value 
    let {id}=req.params;
        const findValue=await Listing.findById(id).populate("reviews").populate("owner").populate("reviews.author");
        if (!findValue) throw new ExpressError(404,"Listing not found.");
        res.render("listings/showvalue",{findValue});
};

module.exports.Sendupdate=(async(req,res)=>{
    let {id}=req.params;
    const  newValue=await Listing.findById(id);
    if (!newValue) throw new ExpressError(404,"Listing not found.");
    res.render("listings/editfrom",{newValue});
});

module.exports.ReciveUpdate=(async(req,res)=>{
    let {id}=req.params;
    const { title, description, price, location, Country } = req.body.listing;
    const permittedChanges = { title, description, price, location, Country };
    if (req.file) permittedChanges.image = { url: req.file.path, filename: req.file.filename };
    const updatedListing = await Listing.findByIdAndUpdate(id, {
        $set: permittedChanges
    }, { runValidators: true });
    if (!updatedListing) throw new ExpressError(404,"Listing not found.");
    if (req.file) await deleteImage(updatedListing.image?.filename);
    req.flash("success","Listing updated.");

    res.redirect("/listings");

});

module.exports.Delete= async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) throw new ExpressError(404,"Listing not found.");
    await deleteImage(listing.image?.filename);
    req.flash("success","Listing deleted.");
    res.redirect("/listings");
};

async function deleteImage(publicId) {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Could not remove listing image from Cloudinary:", error.message);
    }
}
