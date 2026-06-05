const express=require("express");
const router=express.Router();
const User=require("../model/user");
const WrapAsync=require("../utils/wrapAsync");
const passport=require("passport");
const {savedRedirectUrl}=require("../middleware/isAuthenticate");
const userController=require("../controllers/user");

// For Signup 
// Send Form 
router.route("/signup")
    .get(userController.sendSignup)
    .post(WrapAsync(userController.reciveSignup));




router.route("/login")
    .get(userController.sendLogin)
    .post(
    savedRedirectUrl,
    passport.authenticate
    ("local",{
        failureRedirect:"/user/login",
        failureFlash:"Login Credentials Does not match"
    }),
   userController.ReciveLogin);

 
router.route("/logout")
.get(userController.Logout);

module.exports=router;
