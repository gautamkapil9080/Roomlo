const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const ListingSchema=new Schema({
    title:String,
    description:String,
    image:String,
    price:Number,
    location:String,
    Country:String
});

const Listing=mongoose.model("Listing",ListingSchema);
module.exports=Listing;