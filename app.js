require("dotenv").config();
const express = require("express");
const mongoose =require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const md5 = require("md5");

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
    const user = new User({
        email : req.body.username,
        password : md5(req.body.password)
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

app.post("/login",(req,res)=>{
    const userName = req.body.username;
    const password = md5(req.body.password);
    console.log(password);
    User.findOne({email : userName},
        (err,result)=>{
            if(err){
                console.log("Error in finding user : "+err);
            }else if(!result){
                console.log("Username not found!");
            }else{
                if(password === result.password){
                    console.log("Verified!");
                    res.render("secrets");
                }else{
                    res.send("Wrong Password!");
                }
            }
        });
});
















app.listen("3000", (req,res)=>{
    console.log("Server Started at port 3000!");
});