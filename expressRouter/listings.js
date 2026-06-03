// This is Listing Routes Servers //

const express=require("express");
const router=express.Router({mergeParams:true});   // : Accuring the Router Objects 
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {ListingSchema,reviewSchema}=require("../schemavalidation");
const Listing=require("../model/listing");


router.get("/",async(req,res)=>{
    let data = await Listing.find({});
    res.render("listings/index",{data});
})


// *  Create and add new route  *:
router.get("/new",(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("err","Need To login To Make Any Changes");
       return  res.redirect("/user/login");
    }
    res.render("listings/create");
});
// creating the end point to catch after submmision of the creation page.
router.post("/add",
    wrapAsync
    (async(req,res,next)=>{
      let result= ListingSchema.validate(req.body);
      if(result.error){
        throw new ExpressError(404,result.error);
      }
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","Added New List");
    res.redirect("/listings");

}));

router.get("/:id",async(req,res)=>{  // ** To show the value 
    let {id}=req.params;
        const findValue=await Listing.findById(id).populate("reviews");
        res.render("listings/showvalue",{findValue});
})

// ** For Update : 
                // scend form for rendring it!!
router.get("/edit/:id",
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const  newValue=await Listing.findById(id);
    res.render("listings/editfrom",{newValue});
}))

// Update route 
router.put("/submmiteditdata/:id",
    wrapAsync(async(req,res)=>{
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

}));

router.delete("/delete/:id",async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

module.exports =router;