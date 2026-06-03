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
const listings=require("./expressRouter/listings");
const Review=require("./expressRouter/review");
const User=require("./expressRouter/user");
const session=require("express-session");
const flash=require('connect-flash');
const passport=require("passport"); // For passport
const passportLocal=require("passport-local");
const Users=require("./model/user");
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
    await mongoose.connect(MONGO_URL);
}

// Setting Path And Requiring Statics File
app.set("views",path.join(__dirname,"views")); // My ejs file is inside the views file have a look ! 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.set("view engine","ejs"); // Reminder that express need to use  ejs as template engine
app.use(express.static(path.join(__dirname,"/public")));

// Sessions Route : 
    const sessionOptions={
        secret:"mysupersecretcode",
        resave:false,
        saveUninitialized:true,
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
        res.locals.success=req.flash("success");
        next();
    })
// For Listing router :
app.use("/listings",listings);

// For Review router :
app.use("/review",Review);

// For User Router ;

app.use("/user",User);



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





