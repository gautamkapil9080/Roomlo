const express=require("express");
const router=express.Router();
const User=require("../model/user");
const WrapAsync=require("../utils/wrapAsync");
const passport=require("passport");
const {savedRedirectUrl}=require("../middleware/isAuthenticate");

// For Signup 

router.get("/signup",(req,res)=>{
    res.render("users/Signup.ejs")
})
router.post("/signup",WrapAsync(async(req,res)=>{
    try{
     let{username,password,email}=req.body;
    const Uservalue=new User({email,username});
   const final= await User.register(Uservalue,password);
   req.login(final,(err)=>{
    if(err){
        return next (err);
    }
    req.flash("sucess","Suceesfully Signed Up");
   res.redirect("/listings");
   })
    }
   catch(e){
    req.flash("error","e.message");
    res.redirect("/user/signup");
   }
}));


router.get("/login",(req,res)=>{
    res.render("users/login");
})
// For Login 
router.post("/login",
    savedRedirectUrl,
    passport.authenticate
    ("local",{
        failureRedirect:"/user/login",
        failureFlash:"Login Credentials Does not match"
    }),
    async(req,res)=>{
        req.flash("success","Welcome Back!");
        let url=req.session.redirectUrl || "/listings";
        res.redirect(url);
});

// For Logout : 

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are Loged out");
        res.redirect("/listings");
    }); // This is the method to logout the users:

})

module.exports=router;
