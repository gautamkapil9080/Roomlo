const express=require("express");
const router=express.Router();
const User=require("../model/user");
const WrapAsync=require("../utils/wrapAsync");
const passport=require("passport");



router.get("/signup",(req,res)=>{
    res.render("users/Signup.ejs")
})
router.post("/signup",WrapAsync(async(req,res)=>{
    try{
     let{username,password,email}=req.body;
    const Uservalue=new User({email,username});
   const final= await User.register(Uservalue,password);
   req.flash("sucess","Suceesfully Signed Up");
   res.redirect("/listings");
    }
   catch(e){
    req.flash("error","e.message");
    res.redirect("/user/signup");
   }
}));


router.get("/login",(req,res)=>{
    res.render("users/login");
})

router.post("/login",
    passport.authenticate("local",{
        failureRedirect:"/user/login",
        failureFlash:"Login Credentials Does not match"
    }),
    async(req,res)=>{
        req.flash("success","Welcome Back!");
        res.redirect("/listings");
});

module.exports=router;
