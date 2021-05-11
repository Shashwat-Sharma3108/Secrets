require("dotenv").config();
const express = require("express");
const mongoose =require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/userDB",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
});

const userSchema = new mongoose.Schema({
    email : {
        required : true,
        type : String,
        unique : true
    },
    password : {
        required : true,
        type : String,
        min : [6, "Must be 6, got{VALUE}"]
    }
});

const User = new mongoose.model("User",userSchema);

app.get("/" , (req,res)=>{
    res.render("home");
});

app.get("/login" , (req,res)=>{
    res.render("login");
});

app.get("/register" , (req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const user = new User({
            email : req.body.username,
            password : hash
        });
        user.save((err)=>{
            if(err){
                console.log("Error in saving data of new user : "+err);
            }else{
                console.log("Saved Successfully!");
                res.render("secrets");
            }
        });
    });
});

app.post("/login",(req,res)=>{
    const userName = req.body.username;
    const password = req.body.password;

    User.findOne({email : userName},
        (err,result)=>{
            if(err){
                console.log("Error in finding user : "+err);
            }else if(!result){
               res.send("<h1>Username not found!</h1>");
            }else{
                bcrypt.compare(password, result.password, function(err, hashResult) {
                    if(!hashResult){
                        res.send("<h1>Wrong Password!</h1");
                    }else{
                        console.log("Verified!");
                        res.render("secrets");
                    }
                });
            }
        });
});
















app.listen("3000", (req,res)=>{
    console.log("Server Started at port 3000!");
});