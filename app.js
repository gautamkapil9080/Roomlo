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


// *  Create and add new route  *:
// sending request when button is clicked 
app.get("/new",(req,res)=>{
    res.render("listings/create");
});

// creating the end point to catch after submmision of the creation page.
app.post("/add",
    wrapAsync(async(req,res,next)=>{
       let {title,description,price,country,location}=req.body;
    const newListing=new Listing({
        title: title,
        description: description,
        price: price,
        country: country,
        location: location
    })
    await newListing.save();
    res.redirect("/listings");
    

}));

app.get("/listings/:id",async(req,res)=>{  // ** To show the value 
    let {id}=req.params;
        const findValue=await Listing.findById(id);
        res.render("listings/showvalue",{findValue});
})

// ** For Update : 
                // scend form for rendring it!!
app.get("/edit/:id",async(req,res)=>{
    let {id}=req.params;
    const  newValue=await Listing.findById(id);
    res.render("listings/editfrom",{newValue});
})

// Update route 
app.put("/submmiteditdata/:id",async(req,res)=>{
    let {id}=req.params;
    let {title,description,price,location,country}=req.body;
    await Listing.findByIdAndUpdate(id,{
        title:title,
        description:description,
        price:price,
        location:location,
        country:country
    });
    res.redirect("/listings");

});

app.delete("/delete/:id",async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})


// If no route found then it will take response at this route ::
    app.all("*",(req,res,next)=>{
        next(new ExpressError(404,"Page Not found "));
    })

// Middleware for catching the error :

app.use((err,req,res,next)=>{
    let {statuscode,message}=err;
    res.status(statuscode,message);
})

app.listen(port,()=>{
    console.log("Server has been started");
})





