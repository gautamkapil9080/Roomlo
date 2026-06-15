
require('dotenv').config();
const express=require("express");
const app=express();
const mongoose=require('mongoose');
const Listing=require("./model/listing");
const path=require("path");
// const MONGO_URL="mongodb://127.0.0.1:27017/Roomlo";
const dbUrl=process.env.ATLASDB_URL;
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync");
const ExpressError=require("./utils/ExpressError");
const listings=require("./expressRouter/listings");
const Review=require("./expressRouter/review");
const User=require("./expressRouter/user");
const session=require("express-session");
// const MongoStore = require("connect-mongo");
const MongoStore = require("connect-mongo");
const flash=require('connect-flash');
const passport=require("passport"); // For passport
const passportLocal=require("passport-local");
const Users=require("./model/user");
const {currentUser}=require("./middleware/ForAuthorization");


let port=8080;

// Database Connection :
main().
then(()=>{
    console.log("created a db");
})
.catch((err)=>{
    console.log("Not connected db");
})
async function main(){
    await mongoose.connect(dbUrl);
}

// Setting Path And Requiring Statics File
app.set("views",path.join(__dirname,"views")); // My ejs file is inside the views file have a look ! 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.set("view engine","ejs"); // Reminder that express need to use  ejs as template engine
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    collectionName:"sessions",
    // crypto:{
    //     secret:"mysupersecretcode",
    // },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("Error in Mongo Sessions");
});


// Sessions Route : 
    const sessionOptions={
        store,
        secret:"mysupersecretcode",
        resave:false,
        saveUninitialized:false,
        cookie:{
            expires:Date.now() + 7*24*60*60*1000,
            maxAge:7*24*60*60*1000,
            httpOnly:true,
        }
    }


    app.use(session(sessionOptions));
    app.use(flash());

    // For Passports: 
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new passportLocal(Users.authenticate()));

    passport.serializeUser(Users.serializeUser()); // Sesiion ma store garan 
    passport.deserializeUser(Users.deserializeUser());  // Sesions bata remove garna if vayo vana 


    // We are sending the sucess messgage to every route who need they will use :
    app.use((req,res,next)=>{    
        res.locals.error=req.flash("error");      
        res.locals.success=req.flash("success");
        res.locals.err=req.flash("err");
        // res.locals.reqUser = req.user || null;
        res.locals.reqUser=req.user;
        next();
    })

app.use(currentUser);

// For Listing router :
app.use("/listings",listings);

// For Review router :
app.use("/review",Review);

// For User Router ;
app.use("/user",User);

// For Search Route:
app.get("/search",async(req,res)=>{
 let {searchValue}=req.query;
     if(!searchValue || searchValue.trim() === ""){
        req.flash("err","Please enter something to search");
        return res.redirect("/listings");
    }

    let search=await Listing.find({
        location:{
            $regex:searchValue,  // Find Similar Matching Text :
            $options: "i"      // Case Sensative:

        }
    });
    res.render("listings/search",{search});
})



// If no route found then it will take response at this route ::
    // app.all("*",(req,res,next)=>{
    //     next(new ExpressError(404,"Page Not found "));
    // })

// Middleware for catching the error :

// app.use((err,req,res,next)=>{
//     let {statuscode=500,message}=err;
//     // res.status(statuscode).send(message);
//      res.render("listings/error",{message});
// })
app.use((err,req,res,next)=>{

    console.log("FULL ERROR:");
    console.log(err);

    let {statuscode=500,message}=err;

    res.render("listings/error",{message});

})
app.get("/",(req,res)=>{
    res.redirect("/listings");
})

app.listen(port,()=>{
    console.log("Server has been started");
})





