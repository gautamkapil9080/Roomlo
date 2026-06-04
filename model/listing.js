const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const ListingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },

    image:String,

    price:{
      type:Number,
      required:true}
      ,
    location:{
         type:String,
         required:true}
         ,

         Country:{
            type:String,
            required:true
         },
         reviews:[
            {
                type:Schema.Types.ObjectId,
                ref:"reviewModel"
            }
         ],
         owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
         }
         
});

const Listing=mongoose.model("Listing",ListingSchema);
module.exports=Listing;