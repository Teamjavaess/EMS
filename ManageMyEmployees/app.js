const express = require("express");
const mongoose = require("mongoose")
const path = require("path");
const ejs = require("ejs");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');
var csrf = require('csurf');                      //to prevent from cross site request forgery attack. important
var csrfProtection = csrf();
var moment = require('moment');
var passport = require('passport');               //used to add authentication features to your website
var flash = require('connect-flash');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session)
// var MongoStore= MongoDBStore(session);
mongoose.Promise = global.Promise;


require("./src/db/connection");
mongoose.connect("mongodb://localhost:27017/ManageMyEmployees").then(() => { console.log(`DB connection successfull`) })
    .catch((e) => { console.log(e) });

const Users = require("./src/models/Users");
const Leave = require("./src/models/leaveT");
const event = require("./src/models/eventT");
const message = require("./src/models/messagesT");
const project = require("./src/models/projectT");

console.log(Users)
const port = process.env.PORT || 4000;

const static_path = path.join(__dirname, "./public");
const templates_path = path.join(__dirname, "./templates/views");


app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", templates_path);


app.use(express.json());                          //we need to use json seeking permission
app.use(cookieParser());                          //using cookieParser as middle ware
app.use(express.urlencoded({ extended: false }))  // we want to get the info that we enter in the register form , you can not show it undefined.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const store = new MongoDBStore({
    uri: "mongodb://localhost:27017/ManageMyEmployees",
    collection: "mySessions"
})
app.use(session({
    secret: 'mysupersecret', resave: false, saveUninitialized: false, store: store,
    cookie: { maxAge: 600000 },
}));
//   store:new MongoStore({
//     mongooseConnection: mongoose.connection
//   }),

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => {
    res.render("EmsLogin");
})

isAuth= (req,res,next)=>{
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/')
    }
}

const admin=require('./routes/adminRoute');
const hr=require('./routes/hrRoute');
const emp=require('./routes/empRoute');
app.use("/hr",isAuth,hr)
app.use('/emp',isAuth,emp)
app.use('/admin',isAuth,admin)

app.post("/", async(req, res)=>{    //fetching the data entered by user in login page
    try{
        // console.log("hello");
        // console.log(req.session)
        const semail=req.body.email;         //fetching user entered email
        const spassword=req.body.password;   //fetching user enterd password
        // console.log(` the value are ${semail} , ${spassword}`);
        const useremail= await Users.findOne({email:semail});   //getting the email and matching email present in db 
        req.session.user=useremail;
              
        if(useremail.password===spassword && useremail.post==="HR"){
            // console.log("hold on")
            req.session.isAuth=true;
            // console.log(req.session.user)
            // console.log(req.session.user._id)
            res.status(201).redirect("/hr")
            
        }
        else if(useremail.password===spassword && useremail.post==="ADMIN"){
            console.log("hold on this is admin")
            req.session.isAuth=true;
            // console.log(req.session.user)
            // console.log(req.session.user._id)
            res.status(201).redirect("/admin")
          
        }
        else if(useremail.password===spassword && useremail.post==="EMPLOYEE"){
            console.log("hold on this is employee")
            req.session.isAuth=true;
            res.status(201).redirect("/emp")
            
        }
        else{
            console.log("Passwords are not matching")
            res.send("Passwords are not matching");
        }
    }
    catch(err){
        res.status(400).send(err);
    }
});




app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err
        res.redirect("/")
    })
});


app.listen(port, () => { console.log(`server is running at ${port}`) })
