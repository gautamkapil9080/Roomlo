// This is Listing Routes Servers //

const express=require("express");
const router=express.Router({mergeParams:true});   // : Accuring the Router Objects 
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {ListingSchema,reviewSchema}=require("../schemavalidation");
const Listing=require("../model/listing");
const {isLogin}=require("../middleware/isAuthenticate");
const {savedRedirectUrl}=require("../middleware/isAuthenticate");
const {ForEqual}=require("../middleware/ForAuthorization");
const {currentUser}=require("../middleware/ForAuthorization");
const ListingController=require("../controllers/listings");
const multer  = require('multer')
const{storage}=require("../cloudConfig");
const upload = multer({storage}) // Files will be store by multer in cloudinary

router.get("/",(ListingController.index)); // Passing the index call back


// *  Create and add new route  *:
router.get("/new",
isLogin,ListingController.createSend);

// creating the end point to catch after submmision of the creation page.
router.post("/add",upload.single("listing[image]"),
    wrapAsync((ListingController.createRecive))
);

router.get("/:id",ListingController.Showvalue); // To show value :

// ** For Update : 
                // scend form for rendring it!!
router.get("/edit/:id",
    isLogin,ForEqual,
    wrapAsync(ListingController.Sendupdate));

// Update route 
router.put("/submmiteditdata/:id",
    wrapAsync((ListingController.ReciveUpdate)));

router.delete("/delete/:id",
    isLogin,
    ForEqual,
    ListingController.Delete);

module.exports =router;