require("dotenv").config();
const express = require("express");
const mongoose =require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(session({
    secret : "ThisIsaVeryLongSecret!",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
});

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    googleId : String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL : "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/" , (req,res)=>{
    res.render("home");
});

app.get("/login" , (req,res)=>{
    res.render("login");
});

app.get("/register" , (req,res)=>{
    res.render("register");
});

app.get("/secrets" ,(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

app.post("/register",(req,res)=>{
    User.register({username : req.body.username}, req.body.password,
    (err, result)=>{
        if(err){
            console.log("Error in registering user! "+err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            })
        }
    });
});

app.post("/login",(req,res)=>{
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log("Error in logging the user");
        }else{
            passport.authenticate("local")(req,res ,()=>{
                res.redirect("/secrets");
            });
        }
    });
});
















app.listen("3000", (req,res)=>{
    console.log("Server Started at port 3000!");
});