// for google authentication 
// https://www.passportjs.org/packages/passport-google-oauth2/

const passport = require("passport");
require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require("./db/user");


//use .env
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    // add url we added in google console here -- if user is authenticated then it will redirect to below link
    // callbackURL: "http://localhost:3000/auth/google/home",
    callbackURL: "https://employee-db-project.herokuapp.com/auth/google/home",
    passReqToCallback: true
},
    //callback functions
    function (request, accessToken, refreshToken, profile, done) {
        // console.log(profile);
        User.findOrCreate({ username: profile.email, googleId: profile.id, name: profile.displayName}, function (err, user) {
            return done(err, user);
        });
    }
));
