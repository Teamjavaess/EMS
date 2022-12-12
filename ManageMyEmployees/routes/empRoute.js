const express=require("express");
const app=express();
const router=express.Router();
const jwt= require("jsonwebtoken");
const cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');
var csrf = require('csurf');                      //to prevent from cross site request forgery attack. important
var csrfProtection = csrf();
var moment = require('moment');
var passport = require('passport');               //used to add authentication features to your website
var flash= require('connect-flash');


require("../src/db/connection");
const Users=require("../src/models/Users");
const Leave=require("../src/models/leaveT");
const message=require("../src/models/messagesT");
const { hrtime } = require("process");

app.use(express.json());                          //we need to use json seeking permission
app.use(cookieParser());                          //using cookieParser as middle ware
app.use(express.urlencoded({ extended: false }))  // we want to get the info that we enter in the register form , you can not show it undefined.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router.get('/',(req,res)=>{
    // console.log(req.session.user)
    res.render('employee/index',{data:req.session.user})
})
router.get('/Dashboard',(req,res)=>{
    // console.log(req.session.user)
    res.redirect('/emp/');
})

router.get('/lms',(req,res)=>{
    // console.log(req.session.user)
    res.render('employee/leave',{data:req.session.user});
})
router.post('/lms',async (req,res)=>{
    try {
        const cempid=req.session.user.empid;
        console.log(cempid);
        const userleave= await Users.findOne({empid:cempid});
        
        console.log(userleave._id.toString())
        let refid=userleave._id.toString();

        const leaveRegister=new Leave({
            applicantID:refid,
            Day:req.body.day,
            type:req.body.type,
            startDate:req.body.startDate,
            endDate:req.body.endDate,
            comment:req.body.comment
        })

        const leaveregistered=await leaveRegister.save();
        res.status(200).render('employee/leave',{data:req.session.user})
    } catch (error) {
        res.status(400).send(error) 
    }
    
    
})

// router.get('/directory',(req,res)=>{
//     // console.log(req.session.user)
//     res.render('employee/directory')
// })
router.get('/directory', function viewAllEmployees(req, res, next) {

    var userChunks = [];
    var chunkSize = 3;
    //find is asynchronous function
    Users.find({$or: [{post: 'HR'}, {post: 'EMPLOYEE'}]}).sort({_id: -1}).exec(function getUsers(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        console.log("ALl emp data are here")
        console.log(userChunks)
        

        res.render('employee/directory', {
            title: 'All Employees',
            // csrfToken: req.csrfToken(),
            users: userChunks,
            userName: req.session.user.name
        });
    });


});

router.get('/project',(req,res)=>{
    // console.log(req.session.user)
    res.render('employee/project')
})
router.get('/EventCalender',(req,res)=>{
    // console.log(req.session.user)
    res.render('employee/EventCalender')
})

router.get('/Dashboard',(req,res)=>{
    // console.log(req.session.user)
    res.render('employee/index')
})


router.get('/EmpNotification',(req,res)=>{
    // console.log(req.session.user)
    // res.render('employee/EmpNotification')
    var leaveChunks = [];
    var employeeChunks = [];
    var temp;
    //find is asynchronous function  $or: [{post: 'HR'},{post: 'ADMIN'}]
    message.find({to:"employee"}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i])
        }
        for (var i = 0; i < leaveChunks.length; i++) {

            Users.findById(leaveChunks[i].applicantID, function getUser(err, user) {
                if (err) {
                    console.log(err);
                }
                employeeChunks.push(user);

            })
        }

        // call the rest of the code and have it execute after 3 seconds
        setTimeout(render_view, 900);
        function render_view() {
            res.render('employee/EmpNotification', {
                title: 'List Of Leave Applications',
                // csrfToken: req.csrfToken(),
                hasLeave: hasLeave,
                leaves: leaveChunks,
                employees: employeeChunks, moment: moment, userName: req.session.user.name
            });
        }
    });
})
router.get('/EmpNotification/ReqToHr',(req,res)=>{
    // console.log(req.session.user)
    res.render('employee/ReqToHR',{data:req.session.user})

})

router.post('/EmpNotification/ReqToHr',async (req,res)=>{
    try {
        const TO="hr";
        const cempid=req.session.user.empid;
        console.log(cempid);
        const userleave= await Users.findOne({empid:cempid});
        
        console.log(userleave._id.toString())
        let refid=userleave._id.toString();
        const comments=req.body.comment;
    console.log(comments)
    const registerComment=new message({              //we get all the data here here registerEmployee is a instance of Register collection
        applicantID:refid,
        comment:comments,
        to:TO
    })
    const registered=await registerComment.save();

    res.status(201).render('employee/ReqToHR',{data:req.session.user})

    } catch (error) {
        console.log(error)
    }
//     // console.log(req.session.user)
})

router.get('/EmpNotification/ReqToAdmin',(req,res)=>{
    // console.log(req.session.user)
    res.render('employee/ReqToAdmin',{data:req.session.user})
})

router.post('/EmpNotification/ReqToAdmin',async (req,res)=>{
    try {
        const TO="admin";
        const cempid=req.session.user.empid;
        console.log(cempid);
        const userleave= await Users.findOne({empid:cempid});
        
        console.log(userleave._id.toString())
        let refid=userleave._id.toString();
        const comments=req.body.comment;
    console.log(comments)
    const registerComment=new message({              //we get all the data here here registerEmployee is a instance of Register collection
        applicantID:refid,
        comment:comments,
        to:TO
    })
    const registered=await registerComment.save();

    res.status(201).render('employee/ReqToAdmin',{data:req.session.user})

    } catch (error) {
        console.log(error)
    }
//     // console.log(req.session.user)
})
module.exports=router;