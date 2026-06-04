module.exports.isLogin=((req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("err","Need To login To Make Any Changes");
       return  res.redirect("/user/login");
    }
    next();
});

module.exports.savedRedirectUrl=((req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
})
 