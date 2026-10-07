require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");
const ExpressError = require("./utils/ExpressError");
const listings = require("./expressRouter/listings");
const reviews = require("./expressRouter/review");
const users = require("./expressRouter/user");
const User = require("./model/user");
const Listing = require("./model/listing");
const { currentUser } = require("./middleware/ForAuthorization");
const requireConfiguration = require("./utils/configuration");
const buildListingSearch = require("./utils/listingSearch");
const getErrorResponse = require("./utils/errorResponse");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsmate);
if (isProduction) app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

let applicationConfigured = false;

function configureApplication() {
    if (applicationConfigured) return;

    const store = MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: "sessions",
        touchAfter: 24 * 3600
    });
    store.on("error", (error) => {
        console.error("Session store error:", error.message);
    });

    app.use(session({
        store,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction
        }
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new passportLocal(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req, res, next) => {
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        res.locals.err = req.flash("err");
        res.locals.reqUser = req.user;
        next();
    });
    app.use(currentUser);
    app.use("/listings", listings);
    app.use("/review", reviews);
    app.use("/user", users);

    app.get("/search", async (req, res, next) => {
        try {
            const searchCriteria = buildListingSearch(req.query);
            if (!searchCriteria) {
                req.flash("err", "Please enter a destination or keyword to search.");
                return res.redirect("/listings");
            }
            let listingsQuery = Listing.find(searchCriteria.query).limit(100);
            if (searchCriteria.sortSpec) listingsQuery = listingsQuery.sort(searchCriteria.sortSpec);
            const search = await listingsQuery;
            res.render("listings/search", {
                search,
                searchValue: searchCriteria.term,
                sort: searchCriteria.sort,
                priceMin: req.query.priceMin || "",
                priceMax: req.query.priceMax || ""
            });
        } catch (error) {
            next(error);
        }
    });

    app.get("/", (req, res) => res.redirect("/listings"));
    app.use((req, res, next) => next(new ExpressError(404, "Page not found.")));
    app.use((error, req, res, next) => {
        const response = getErrorResponse(error);
        if (response.status >= 500) console.error("Request failed:", error);
        res.status(response.status).render("listings/error", { message: response.message });
    });
    applicationConfigured = true;
}

async function startServer() {
    const port = requireConfiguration();
    await mongoose.connect(process.env.ATLASDB_URL, { serverSelectionTimeoutMS: 15000 });
    configureApplication();
    app.listen(port, () => console.log(`Roomlo listening on port ${port}`));
}

if (require.main === module) {
    startServer().catch((error) => {
        if (error.code === 8000 || error.codeName === "AtlasError" || error.codeName === "AuthenticationFailed") {
            console.error("Roomlo startup failed: MongoDB authentication failed. Check the database username and password in ATLASDB_URL, and URL-encode any special characters.");
        } else {
            console.error("Roomlo startup failed:", error.message);
        }
        process.exitCode = 1;
    });
}

module.exports = { app, startServer, requireConfiguration };
