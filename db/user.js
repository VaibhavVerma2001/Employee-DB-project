// To store registered Users data used for login 

const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate'); //related google auth 
require('dotenv').config();



const url = process.env.DB_CONNECT;
mongoose.connect(url);

mongoose.connection
    .once('open', function () {
        console.log('Successfully connected to Database User collection ...');
    })
    .on('error', function (err) {
        console.log(err);
});


const userSchema = new mongoose.Schema({
    name: String,
    username: String, //email
    password: String,
    // googleId to store google id of new users in DB
    googleId: String
});


// setup passport-local-mongoose  after making Schema ==> https://www.npmjs.com/package/passport-local-mongoose

userSchema.plugin(passportLocalMongoose); //this will do salting and hashing

userSchema.plugin(findOrCreate);//google auth related


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy()); // for local register and login

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});



module.exports = User;