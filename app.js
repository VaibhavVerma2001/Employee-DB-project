const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require('connect-flash');
const Employee = require("./db/employee");
const User = require("./db/user");
const auth = require("./auth");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//middleware for express session
app.use(session({
    secret: "Long Secret String",
    resave: false,
    saveUninitialized: false
}));

//  initialise passport just below session
app.use(passport.initialize());
app.use(passport.session());

//middleware for connect flash
app.use(flash());

//Setting messages variables globally
app.use((req, res, next) => {
    res.locals.success_msg = req.flash(('success_msg'));
    res.locals.error_msg = req.flash(('error_msg'));
    next();
});


app.get("/", (req, res) => {
    res.render("register");
});

app.get("/auth/google",
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }
    ));

app.get("/auth/google/home",
    passport.authenticate('google', { failureRedirect: "/" }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/home");
    });


app.get("/home", (req, res) => {
    if (req.isAuthenticated()) {
        Employee.find({}, function (err, foundemployees) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("home", { foundemployees: foundemployees });
            }
        });
    }
    else {
        res.redirect("/");
    }
});


app.get("/create", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("create");
    }
    else {
        res.redirect("/");
    }

});


app.get("/delete/:employeeId", function (req, res) {

    if (req.isAuthenticated()) {
        let employeeId = req.params.employeeId;

        Employee.deleteOne({ _id: employeeId }, function (err) {
            if (err) {
                console.log(err);
                req.flash("error_msg", "Error" + err);
                res.redirect("/home");
            }
            else {
                req.flash("success_msg", "Employee Deleted Successfully.")
                res.redirect("/home");
            }
        });
    }
    else {
        res.redirect("/");
    }

});

app.get("/edit/:employeeId", function (req, res) {

    if (req.isAuthenticated()) {
        let employeeId = req.params.employeeId;

        Employee.findOne({ _id: employeeId }, function (err, employee) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("edit", { employee: employee });
            }
        });
    }
    else {
        res.redirect("/");
    }
});



app.post("/create", (req, res) => {
    // console.log(req.body);
    const name = req.body.name;
    const username = req.body.username;
    const gender = req.body.gender;
    const dob = req.body.dob;
    const status = req.body.status;

    const newEmployee = new Employee({
        name: name,
        username: username,
        gender: gender,
        dob: dob,
        status: status
    });

    newEmployee.save(function (err) {
        if (err) {
            // console.log(err);
            req.flash("error_msg", "Error" + err);
            res.redirect("/create");
        }
        else {
            // console.log("Suceessfully created new employee...");
            req.flash("success_msg", "Employee Created Successfully.")
            res.redirect("/home");
        }
    });
});


app.post("/edit/:employeeId", function (req, res) {
    let employeeId = req.params.employeeId;

    const newname = req.body.name;
    const newusername = req.body.username;
    const newgender = req.body.gender;
    const newstatus = req.body.status;
    const newdob = req.body.dob;

    Employee.updateOne({ _id: employeeId }, { name: newname, username: newusername, gender: newgender, dob: newdob, status: newstatus }, function (err, employee) {
        if (err) {
            // console.log(err);
            req.flash("error_msg", "Error" + err);
            res.redirect("/home");
        }
        else {
            req.flash("success_msg", "Updated Successfully.");
            res.redirect("/home");
        }
    });
});


app.post("/register", (req, res) => {

    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (password != cpassword) {
        req.flash("error_msg", "Password and Confirm password not matched. Try Again!");
        res.redirect("/");
    }
    else {
        User.register({ username: req.body.username, name: req.body.name }, req.body.password, function (err, user) {
            if (err) {
                // console.log(err);
                // res.send("This email is already registered or fill all fields , kindly login...");
                req.flash("error_msg", "Email already Registered, kindly login.");
                res.redirect("/");
            }
            else {
                //if they registered successfully
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/home");
                });
            }
        });
    }
});


app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            // if no error then authenticate user
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    });
});

//logout -- deauthenticate and end session
app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        else {
            req.session.destroy(); //to destroy current session
            res.redirect('/');
        }
    });
});


const port = process.env.PORT || 3000 ;
app.listen(port, function () {
    console.log("Server connected successfully...");
});
