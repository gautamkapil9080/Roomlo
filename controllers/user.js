const User=require("../model/user");





module.exports.sendSignup=(req,res)=>{
    res.render("users/Signup.ejs")
}

module.exports.reciveSignup=(async(req,res)=>{
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
});


module.exports.sendLogin=(req,res)=>{
    res.render("users/login");
};

module.exports.ReciveLogin= async(req,res)=>{
        req.flash("success","Welcome Back!");
        let url=req.session.redirectUrl || "/listings";
        res.redirect(url);
};

module.exports.Logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are Loged out");
        res.redirect("/listings");
    }); // This is the method to logout the users:

};
