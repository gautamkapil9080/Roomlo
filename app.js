const express=require("express");
const app=express();
const mongoose=require('mongoose');
const Listing=require("./model/listing");
const path=require("path");
const MONGO_URL="mongodb://127.0.0.1:27017/Roomlo";
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
app.set("view engine","ejs"); // Reminder that express need to use  ejs as template engine
app.set("views",path.join(__dirname,"views")); // My ejs file is inside the views file have a look ! 
app.use(express.urlencoded({extended:true}));
let port=8080;
app.get("/",(req,res)=>{
    res.send("Data is accepting!");
})

app.get("/listings",async (req,res)=>{ // index route : 
        let data= await Listing.find({})
        res.render("listings/index",{data});
})

// Create and add new route :

// sending request when button is clicked 
app.get("/new",(req,res)=>{
    res.render("listings/create");
});

// creating the end point to catch after submmision of the creation page.
app.post("/new/add",(req,res)=>{
    
})


app.get("/listings/:id",async(req,res)=>{ // To show the value 
    let {id}=req.params;
        const findValue=await Listing.findById(id);
        res.render("listings/showvalue",{findValue});
})
// Create and add new route :

// sending request when button is clicked 
app.get("/new",(req,res)=>{
    res.render("listings/create");
});

// creating the end point to catch after submmision of the creation page.
app.post("/add",async(req,res)=>{
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

})


app.listen(port,()=>{
    console.log("Server has been started");
})





