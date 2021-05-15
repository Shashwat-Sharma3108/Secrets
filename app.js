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
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();

app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(session({
    secret : <Any String of Your Choice>,
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin_Shashwat:"+process.env.AtlasPassword+"@cluster1.yglo4.mongodb.net/userDB?retryWrites=true&w=majority",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
});

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    googleId : String,
    secret : String
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
    callbackURL: "https://agile-harbor-47891.herokuapp.com/auth/google/secrets",
    userProfileURL : "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APPID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: "https://agile-harbor-47891.herokuapp.com/auth/facebook/secrets",
    profileFields : ['id', 'displayName']
    
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ username: profile.id }, function (err, user) {
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
  User.find({"secret": {$ne:null}},(err,result)=>{
    if(err){
      console.log("Error in showing secrets "+err);
    }if(result){
      res.render("secrets",{usersWithSecrets : result});
    }
  });
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

  app.get('/auth/facebook',
  passport.authenticate('facebook')
  );

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
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

app.get("/submit" , (req,res)=>{
  if(req.isAuthenticated){
    res.render("submit");
  }else{
    res.redirect("/login");
  }
});

app.post("/submit",(req,res)=>{
  const submittedSecret = req.body.secret;
  
  User.findById(req.user._id || req.user.email , (err, result)=>{
    if(err){
      console.log("Error in posting secret "+err);
    }else if(!result){
      console.log("No user found");
    }else{
      result.secret=submittedSecret;
      result.save((err)=>{
        if(err){
          console.log("Error in saving the user secret!");
        }else{
          res.redirect("/secrets");
        }
      });
    }
  });
});

app.listen(process.env.PORT || "3000", (req,res)=>{
    console.log("Server Started at port 3000!");
});
