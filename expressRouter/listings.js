// This is Listing Routes Servers //

const express=require("express");
const router=express.Router({mergeParams:true});   // : Accuring the Router Objects 
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {ListingSchema}=require("../schemavalidation");
const {isLogin}=require("../middleware/isAuthenticate");
const {ForEqual}=require("../middleware/ForAuthorization");
const ListingController=require("../controllers/listings");
const validateRequest = require("../middleware/validateRequest");
const requireListingImage = require("../middleware/requireListingImage");
const multer  = require('multer')
const{storage}=require("../cloudConfig");
const uploadPolicy=require("../utils/listingUploadPolicy");
const upload = multer({
    storage,
    limits: { fileSize: uploadPolicy.maxFileSize, files: 1 },
    fileFilter: (req, file, callback) => {
        const validationMessage = uploadPolicy.validateFile(file);
        if (validationMessage) return callback(new ExpressError(400, validationMessage));
        callback(null, true);
    }
});

router.get("/",wrapAsync(ListingController.index)); // Passing the index call back


// *  Create and add new route  *:
router.get("/new",
isLogin,ListingController.createSend);

// creating the end point to catch after submmision of the creation page.
router.post("/add",isLogin,upload.single("listing[image]"),
    validateRequest(ListingSchema),requireListingImage,
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
    isLogin,ForEqual,upload.single("listing[image]"),validateRequest(ListingSchema),
    wrapAsync((ListingController.ReciveUpdate)));

router.delete("/delete/:id",
    isLogin,
    ForEqual,
    ListingController.Delete);

module.exports =router;
