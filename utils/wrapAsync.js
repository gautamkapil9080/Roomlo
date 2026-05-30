module.exports=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    };
}

// Instead of writing try and catch we can create the middleware by writing this one in the simple w
// way: 
//  try{
//        let {title,description,price,country,location}=req.body;
//     const newListing=new Listing({
//         title: title,
//         description: description,
//         price: price,
//         country: country,
//         location: location
//     })
//     await newListing.save();
//     res.redirect("/listings"); 
//     }
//     catch(err){
//         next(err);
//     }
