const express=require("express");
const app=express();
const mongoose=require('mongoose');
const Listing=require("./model/listing");
const path=require("path");
const MONGO_URL="mongodb://127.0.0.1:27017/Roomlo";
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync");
const ExpressError=require("./utils/ExpressError");
const {ListingSchema,reviewSchema}=require("./schemavalidation");
const Review=require("./model/review");


main().
then(()=>{
    console.log("created a db");
})
.catch((err)=>{
    console.log("Not connected db");
})
async function main(){
    await mongoose.connect(MONGO_URL);
}
app.set("views",path.join(__dirname,"views")); // My ejs file is inside the views file have a look ! 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.set("view engine","ejs"); // Reminder that express need to use  ejs as template engine
app.use(express.static(path.join(__dirname,"/public")));

let port=8080;
app.get("/",(req,res)=>{
    res.send("Data is accepting!");
})

app.get("/listings",async (req,res)=>{ // index route : 
        let data= await Listing.find({})
        res.render("listings/index",{data});
})


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


// *  Create and add new route  *:
app.get("/new",(req,res)=>{
    res.render("listings/create");
});
// creating the end point to catch after submmision of the creation page.
app.post("/add",
    wrapAsync
    (async(req,res,next)=>{
      let result= ListingSchema.validate(req.body);
      if(result.error){
        throw new ExpressError(404,result.error);
      }
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));

app.get("/listings/:id",async(req,res)=>{  // ** To show the value 
    let {id}=req.params;
        const findValue=await Listing.findById(id).populate("reviews");
        res.render("listings/showvalue",{findValue});
})

// ** For Update : 
                // scend form for rendring it!!
app.get("/edit/:id",
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const  newValue=await Listing.findById(id);
    res.render("listings/editfrom",{newValue});
}))

// Update route 
app.put("/submmiteditdata/:id",
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let {title,description,price,location,country}=req.body;
    if(!req.body.listings){
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

app.delete("/delete/:id",async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// For review Route : 

app.get("/review/:id",async (req,res)=>{
    let{id}=req.params;
    let value=await Listing.findById(id);
    value=(value.title);
    res.render("listings/review",{value,id});
});

app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let review = new Review(req.body.reviews);
    await review.save();
    listing.reviews.push(review._id);
    await listing.save();
    res.redirect(`/listings/${id}`);

}));

// If no route found then it will take response at this route ::
    // app.all("*",(req,res,next)=>{
    //     next(new ExpressError(404,"Page Not found "));
    // })

// Middleware for catching the error :

app.use((err,req,res,next)=>{
    let {statuscode=500,message}=err;
    // res.status(statuscode).send(message);
     res.render("listings/error",{message});
})

app.listen(port,()=>{
    console.log("Server has been started");
})





