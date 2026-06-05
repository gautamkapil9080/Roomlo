const Listing=require("../model/listing");

module.exports.index=async(req,res)=>{
    let data = await Listing.find({});
    res.render("listings/index",{data})};

module.exports.createSend=(req,res)=>{
res.render("listings/create");
};

module.exports.createRecive=(async(req,res,next)=>{
        let result=ListingSchema.validate(req.body);
        if(result.error){
            throw new ExpressError(404,result.error);
        }
        const newListing=new Listing(req.body.listing);
        newListing.owner=req.user._id;
        await newListing.save();
        console.log(newListing);
        req.flash("success","Added New List");
        res.redirect("/listings");
});

module.exports.Showvalue=async(req,res)=>{  // ** To show the value 
    let {id}=req.params;
        const findValue=await Listing.findById(id).populate("reviews").populate("owner");
        res.render("listings/showvalue",{findValue});
};

module.exports.Sendupdate=(async(req,res)=>{
    let {id}=req.params;
    const  newValue=await Listing.findById(id);
    res.render("listings/editfrom",{newValue});
});

module.exports.ReciveUpdate=(async(req,res)=>{
    let {id}=req.params;
    let {title,description,price,location,country}=req.body;
    if(!req.body.listing){
        throw new ExpressError(404,"Send Valid Data");
        }
    await Listing.findByIdAndUpdate(id,{
        title:title,
        description:description,
        price:price,
        location:location,
        country:country
    });
    
    res.redirect("/listings");

});

module.exports.Delete= async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
};