const User = require("../model/user");

module.exports.sendSignup = (req, res) => {
    res.render("users/Signup.ejs");
};

module.exports.reciveSignup = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = await User.register(new User({ email, username }), password);
        req.login(user, (error) => {
            if (error) return next(error);
            req.flash("success", "Successfully signed up.");
            res.redirect("/listings");
        });
    } catch (error) {
        if (error.name === "UserExistsError") {
            req.flash("error", "That username is already taken.");
            return res.redirect("/user/signup");
        }
        next(error);
    }
};

module.exports.sendLogin = (req, res) => {
    res.render("users/login");
};

module.exports.ReciveLogin = async (req, res) => {
    req.flash("success", "Welcome back!");
    const destination = req.session.redirectUrl;
    delete req.session.redirectUrl;
    const safeDestination = typeof destination === "string" && destination.startsWith("/") && !destination.startsWith("//")
        ? destination
        : "/listings";
    res.redirect(safeDestination);
};

module.exports.Logout = (req, res, next) => {
    req.logout((error) => {
        if (error) return next(error);
        req.flash("success", "You are logged out.");
        res.redirect("/listings");
    });
};
