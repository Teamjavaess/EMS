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
const message=require("../src/models//messagesT");
const project=require("../src/models/projectT");
const portal=require("../src/models/portalT");
const department=require("../src/models/departmentT");



app.use(express.json());                          //we need to use json seeking permission
app.use(cookieParser());                          //using cookieParser as middle ware
app.use(express.urlencoded({ extended: false }))  // we want to get the info that we enter in the register form , you can not show it undefined.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function viewAllEmployees(req, res, next) {

    var userChunks = [];
    var chunkSize = 3;
    //find is asynchronous function
    Users.find({$or: [{post: 'HR'}, {post: 'EMPLOYEE'}]}).sort({_id: -1}).exec(function getUsers(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        res.render('admin/AdminDirectory', {
            title: 'All Employees',
            // csrfToken: req.csrfToken(),
            users: userChunks,
            userName: req.session.user.name
        });
    });
});
router.get("/AdminDirectory", (req, res) => { res.redirect("/admin/") });

// ---------------Adding Employee-----------------------------------------------
router.get("/AdminAddEmp", (req, res) => { res.render("admin/AdminAddEmp") });

router.post("/AdminAddEmp", async (req, res) => {                  // receiving the data of new user and  storing in db
    console.log("you are about to add")
    try {
        const password=req.body.password;
        const cpassword=req.body.confirmpass;
        console.log(`the entered password is  ${password}`)
        if(password===cpassword){

                const registerEmployee=new Users({              //we get all the data here here registerEmployee is a instance of Register collection
                    empid:req.body.empid,
                    email:req.body.email,
                    password:req.body.password,
                    confirmPass:req.body.confirmpass
                })
            //tokens are middleware present in between two process    
            console.log("the success part is "+registerEmployee);
    
            
            const registered=await registerEmployee.save();    //we need to save data in our database
            console.log("the page start "+registered)
            res.status(201).render("admin/AdminAddEmp");                   //we have to give a status code when developing someting . and also rendering the data  
        }
        else{
            res.send("passwords are not matching");
        }
    }
    catch (error) { res.status(400).send(error) }
});  


//---------------------------Deleting Employee------------------------------------------------------
// router.post('//:id', function deleteEmployee(req, res) {
//     var id = req.params.id;
//     Users.findByIdAndRemove({_id: id}, function deleteUser(err) {
//         if (err) {
//             console.log('unable to delete employee');
//         }
//         else {
//             res.redirect('/admin/');
//         }
//     });
// });

router.post('/delete-employee/:id', function deleteEmployee(req, res) {
    var id = req.params.id;
    Users.findByIdAndRemove({_id: id}, function deleteUser(err) {
        if (err) {
            console.log('unable to delete employee');
        }
        else {
            res.redirect('/admin/');
        }
    });
});

// ------------ Message code----------------------------------------------
router.get('/AdminRequests',(req,res)=>{
    console.log(req.session.user)
    console.log("this is admin request")
    var leaveChunks = [];
    var employeeChunks = [];
    var temp;
    // find is asynchronous function
    message.find({to:"admin"}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
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

        console.log(employeeChunks)
        console.log(leaveChunks)
        // call the rest of the code and have it execute after 3 seconds
        setTimeout(render_view, 900);
        function render_view() {
            res.render('admin/AdminRequests', {
                title: 'List Of Leave Applications',
                // csrfToken: req.csrfToken(),
                hasLeave: hasLeave,
                leaves: leaveChunks,
                employees: employeeChunks, moment: moment, userName: req.session.user.name
            });
        }
    });
})

router.get('/AdminRequests/ReqToHr',(req,res)=>{
    // console.log(req.session.user)
    res.render('admin/ReqToHR',{data:req.session.user})

})

router.post('/AdminRequests/ReqToHr',async (req,res)=>{
    try {
    
        const cempid=req.session.user.empid;
        console.log(cempid);
        const userleave= await Users.findOne({empid:cempid});
        
        console.log(userleave._id.toString())
        let refid=userleave._id.toString();
        const comments=req.body.comment;
    console.log(comments)
    const registerComment=new message({              //we get all the data here here registerEmployee is a instance of Register collection
        to:"hr",
        applicantID:refid,
        comment:comments
    })
    const registered=await registerComment.save();

    res.status(201).render('admin/ReqToHR',{data:req.session.user})

    } catch (error) {
        console.log(error)
    }
//     // console.log(req.session.user)
})

router.get('/AdminRequests/ReqToEmployee',(req,res)=>{
    // console.log(req.session.user)
    res.render('admin/ReqToEmployee',{data:req.session.user})
})

router.post('/AdminRequests/ReqToEmployee',async (req,res)=>{
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

    res.status(201).render('admin/ReqToEmployee',{data:req.session.user})

    } catch (error) {
        console.log(error)
    }
    // console.log(req.session.user)
})
//------------------------------ project features -----------------------------------------------

 router.get('/AdminProjects',(req,res)=>{
    var leaveChunks = [];
    var employeeChunks = [];
    var temp;
    project.find({}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i])
        }
        // call the rest of the code and have it execute after 3 seconds
        setTimeout(render_view, 900);
        function render_view() {
            res.render('admin/AdminProjects', {
                title: 'List Of Leave Applications',
                hasLeave: hasLeave,
                projects: leaveChunks,
                moment: moment, userName: req.session.user.name
            });
        }
    });
})

router.get('/AdminProjects/AdminAddProjects',(req,res)=>{
    res.render('admin/AdminAddProjects')
})
router.post('/AdminProjects/AdminAddProjects',async (req,res)=>{
    try {
        const cempid=req.session.user.empid;
        console.log(cempid);
    console.log("you are in project section")
    const registerComment=new project({              //we get all the data here here registerEmployee is a instance of Register collection
        portalname:req.body.portalname,
        portalhead:req.body.portalhead,
        status:req.body.status,
        clientname:req.body.clientname,
        server:req.body.server
    })
    const registered=await registerComment.save();

    res.status(201).redirect('/admin/AdminProjects')

    } catch (error) {
        console.log(error)
    }
})

//--------------------department features---------------------------------
router.get('/AdminDepartments', function viewAlldept(req, res, next) {

    var userChunks = [];
    var chunkSize = [];
    console.log("you are in department section")
    department.find({}).sort({_id: -1}).exec(function getUsers(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        console.log("ALl dept data are here")
        console.log(userChunks)
        

        res.render('admin/AdminDepartments', {
            title: 'All Departments',
            dept:userChunks,
            userName: req.session.user.name
        });
    });


});
router.get('/AdminDepartments/AdminAddDept',(req,res)=>{
    res.render('admin/AdminAddDept')
})
router.post('/AdminDepartments/AdminAddDept',async (req,res)=>{
    try {
        const cempid=req.session.user.empid;
        console.log(cempid);
    console.log("you are in project section")
    const registerComment=new department({              //we get all the data here here registerEmployee is a instance of Register collection
        portalname:req.body.portalname,
        portalhead:req.body.portalhead,
        status:req.body.status,
    })
    const registered=await registerComment.save();

    res.status(201).redirect('/admin/AdminDepartments')

    } catch (error) {
        console.log(error)
    }
})

//-----------------------Portal Feature----------------------------------------

// router.get("/AdminPortalMaster", (req, res) => { res.render("admin/AdminPortalMaster") });

router.get('/AdminPortalMaster', function viewAlldept(req, res, next) {

    var userChunks = [];
    var chunkSize = [];
    console.log("you are in department section")
    portal.find({}).sort({_id: -1}).exec(function getUsers(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        console.log("ALl dept data are here")
        console.log(userChunks)
        

        res.render('admin/AdminPortalMaster', {
            title: 'All Departments',
            portal:userChunks,
            userName: req.session.user.name
        });
    });


});
router.get('/AdminPortalMaster/AdminAddPortal',(req,res)=>{
    res.render('admin/AdminAddPortal')
})
router.post('/AdminPortalMaster/AdminAddPortal',async (req,res)=>{
    try {
        const cempid=req.session.user.empid;
        console.log(cempid);
    console.log("you are in project section")
    const registerComment=new portal({              //we get all the data here here registerEmployee is a instance of Register collection
        portalname:req.body.portalname,
        status:req.body.status,
    })
    const registered=await registerComment.save();

    res.status(201).redirect('/admin/AdminPortalMaster')

    } catch (error) {
        console.log(error)
    }
})

//-----------------------------------Adding Events to calender--------------------------------
router.get("/AdminEvents", (req, res) => { res.render("admin/AdminEvents") });

module.exports=router;