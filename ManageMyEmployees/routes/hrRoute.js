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
const event=require("../src/models/eventT");
const { findByIdAndUpdate } = require("../src/models/leaveT");

app.use(express.json());                          //we need to use json seeking permission
app.use(cookieParser());                          //using cookieParser as middle ware
app.use(express.urlencoded({ extended: false }))  // we want to get the info that we enter in the register form , you can not show it undefined.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router.get('/',(req,res)=>{
    // console.log(req.session.user)
    res.render('hr/Hrindex',{data:req.session.user})
})

router.get('/Hrindex',(req,res)=>{
    res.render('hr/Hrindex',{data:req.session.user})
})

// router.get('/Hrdirectory',(req,res)=>{
//     res.render('hr/Hrdirectory')
// })

router.get('/Hrdirectory', function viewAllEmployees(req, res, next) {

    var userChunks = [];
    var chunkSize = 3;
    //find is asynchronous function
    Users.find({$or: [{post: 'HR'}, {post: 'EMPLOYEE'}]}).sort({_id: -1}).exec(function getUsers(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        // console.log("ALl emp data are here")
        // console.log(userChunks)
        

        res.render('hr/Hrdirectory', {
            title: 'All Employees',
            // csrfToken: req.csrfToken(),
            users: userChunks,
            userName: req.session.user.name
        });
    });


});

router.get('/HrEditForm/:id', function editEmployee(req, res, next) {
    var employeeId = req.params.id;
    console.log("you are in HR edit section")
    console.log(employeeId);
    Users.findById(employeeId, function getUser(err, user) {
        if (err) {
            res.redirect('/Hrdirectory');
        }
        res.render('hr/HrEditForm', {
            title: 'Edit Employee',
            // csrfToken: req.csrfToken(),
            data: user,
            moment: moment,
            message: '',
            userName: req.session.user.name
        });


    });

});

router.post('/HrEditForm/:id', function editEmployee(req, res) {
    var id = req.params.id;

    const updateDocument= async (id)=>{
        try {
            const result=await Users.findByIdAndUpdate({_id:id},{$set:{
                post:req.body.post,
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        contactNumber:req.body.contactNumber,
        joiningdate:req.body.joiningdate,
        dateOfBirth:req.body.dateOfBirth,
        address:req.body.address,
        gender:req.body.gender,
        bloodgroup:req.body.bloodgroup,
        department:req.body.department,
        manager:req.body.manager,
        managerEmail:req.body.managerEmail,
        photo:req.body.photo,
        role:req.body.role,
        facebookid:req.body.facebookid,
        twiterid:req.body.twiterid,
        instagramid:req.body.instagramid,
        githubid:req.body.githubid,
        website:req.body.website
            }})
        } catch (error) {
            console.log(error)
        }
    }
    // const user=Users.findById(empid, function(req,user){
    //     console.log(user);
    //     user.post=req.body.post;
    //     user.firstname=req.body.firstname;
    //     user.lastname=req.body.lastname;
    //     user.contactNumber=req.body.contactNumber;
    //     user.joiningdate=req.body.joiningdate;
    //     user.dateOfBirth=req.body.dateOfBirth;
    //     user.address=req.body.address;
    //     user.gender=req.body.gender;
    //     user.bloodgroup=req.body.bloodgroup;
    //     user.department=req.body.department;
    //     user.manager=req.body.manager;
    //     user.managerEmail=req.body.managerEmail;
    //     user.photo=req.body.photo;
    //     user.role=req.body.role;
    //     user.facebookid=req.body.facebookid;
    //     user.twiterid=req.body.twiterid;
    //     user.instagramid=req.body.instagramid;
    //     user.githubid=req.body.githubid;
    //     user.website=req.body.website;

    //     user.save(function saveUser(err) {
    //         if (err) {
    //             console.log(error);
    //         }
    //         res.redirect('hr/Hrdirectory');

    //     });
    // });
    updateDocument(id);
    res.redirect("/hr/Hrdirectory");
});

router.get('/HrProjects',(req,res)=>{
    res.render('hr/HrProjects')
})


router.get('/HrLeaves', function getLeaveApplications(req, res, next) {

    var leaveChunks = [];
    var employeeChunks = [];
    var temp;
    //find is asynchronous function
    Leave.find({}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
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
            res.render('hr/HrLeaves', {
                title: 'List Of Leave Applications',
                // csrfToken: req.csrfToken(),
                hasLeave: hasLeave,
                leaves: leaveChunks,
                employees: employeeChunks, moment: moment, userName: req.session.user.name
            });
        }
    });

});

// router.post("/HrLeaves/:id", function deletetion(req,res,next){
//     const leaveid=req.params.id;
//     const deletedocument=async (leaveid)=>{
//         try {
//             const result=await Leave.findByIdAndDelete({_id:leaveid})
//         } catch (error) {
//             console.log(error)
//         }
//     }
//     res.redirect("/HrLeaves");
//     deletedocument(leaveid);
// })
// router.post('/HrLeave/:id', function deleteEmployee(req, res) {
//     var id = req.params.id;
//     Leave.findByIdAndRemove({_id: id}, function deleteUser(err) {
//         if (err) {
//             console.log('unable to delete employee');
//         }
//         else {
//             res.redirect('/hr/HrLeaves');
//         }
//     });
// });

// router.get('/HrNotifications',(req,res)=>{
//     res.render('hr/HrNotificatons')
// })
router.get('/HrNotifications',(req,res)=>{
    // console.log(req.session.user)
    // res.render('employee/EmpNotification')
    var leaveChunks = [];
    var employeeChunks = [];
    var temp;
    //find is asynchronous function
    message.find({to:"hr"}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
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
console.log("this is has leave")
        // call the rest of the code and have it execute after 3 seconds
        setTimeout(render_view, 900);
        function render_view() {
            res.render('hr/HrNotificatons', {
                title: 'List Of Leave Applications',
                // csrfToken: req.csrfToken(),
                hasLeave: hasLeave,
                leaves: leaveChunks,
                employees: employeeChunks, moment: moment, userName: req.session.user.name
            });
        }
    });
})

router.get('/HrNotifications/ReqToAdmin',(req,res)=>{
    // console.log(req.session.user)
    res.render('hr/ReqToAdmin',{data:req.session.user})

})

router.post('/HrNotifications/ReqToAdmin',async (req,res)=>{
    try {
    
        const cempid=req.session.user.empid;
        console.log(cempid);
        const userleave= await Users.findOne({empid:cempid});
        
        console.log(userleave._id.toString())
        let refid=userleave._id.toString();
        const comments=req.body.comment;
    console.log(comments)
    const registerComment=new message({              //we get all the data here here registerEmployee is a instance of Register collection
        to:"admin",
        applicantID:refid,
        comment:comments
    })
    const registered=await registerComment.save();

    res.status(201).render('hr/ReqToAdmin',{data:req.session.user})

    } catch (error) {
        console.log(error)
    }
//     // console.log(req.session.user)
})

router.get('/HrNotifications/ReqToEmployee',(req,res)=>{
    // console.log(req.session.user)
    res.render('hr/ReqToEmployee',{data:req.session.user})
})

router.post('/HrNotifications/ReqToEmployee',async (req,res)=>{
    try {
        const cempid=req.session.user.empid;
        console.log(cempid);
        const userleave= await Users.findOne({empid:cempid});
        
        console.log(userleave._id.toString())
        let refid=userleave._id.toString();
        const comments=req.body.comment;
    console.log(comments)
    const registerComment=new message({              //we get all the data here here registerEmployee is a instance of Register collection
        to:"employee",
        applicantID:refid,
        comment:comments
    })
    const registered=await registerComment.save();

    res.status(201).render('hr/ReqToEmployee',{data:req.session.user})

    } catch (error) {
        console.log(error)
    }
    // console.log(req.session.user)
})
//---------Deleting leave request---------------------------------------------------------------
router.post('/delete-req/:id', function deleteEmployee(req, res) {
    var id = req.params.id;
    console.log(id)
    Leave.findByIdAndRemove({_id: id}, function deleteUser(err) {
        if (err) {
            console.log('unable to delete employee');
        }
        else {
            res.redirect('/hr/HrLeaves');
        }
    });
});

//------------Event features-------------------------------------------------------------------
router.get('/HrCalender',(req,res)=>{
    res.render('hr/HrCalender')
})

router.get('/HrCalender/HrAddEvent',(req,res)=>{
    res.render('hr/HrAddEvent',{data:req.session.user})
})

module.exports=router;