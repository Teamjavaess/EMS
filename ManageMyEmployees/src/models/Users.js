var mongoose = require('mongoose');
// var bcrypt = require('bcrypt-nodejs');
require('mongoose-type-email');
var Schema = mongoose.Schema;

var user = new Schema({
    post:{type:String},
    firstname:{type:String},
    lastname:{type:String},
    empid:{type:String,required:true,unique:true},
    email: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
    contactNumber: {type: String},
    joiningdate:{type:String},
    dateOfBirth: {type:String},
    address:{type:String},
    gender:{type:String},
    bloodgroup:{type:String},
    department: {type:String},
    manager:{type:String},
    managerEmail:{type:String},
    photo:{data:Buffer,
        type:String
    },
    role:{type:String},
    password: {type: String,unique:true, required:true},
    confirmPass:{type:String,unique:true,required:true},
    facebookid:{type:String},
    twiterid:{type:String},
    instagramid:{type:String},
    website:{type:String},
    githubid:{type:String},

});
const usertable=new mongoose.model("User",user);

const createDoc = async () => {
    try {
        const admin = new usertable({
            post:"ADMIN",
            firstname:"Admin",
            lastname :"Admin",
            empid:"IF001",
            email:"admin@if.com",
            password:"admin001",
            confirmPass:"admin001"
        })
        //FOR single document pass
        const result= await admin.save();       //await for waiting
    } catch (error) {
        console.log(error);
    }
}
const createDoc2 = async () => {
    try {
        const admin = new usertable({
            post:"HR",
            firstname:"HRFirst",
            lastname :"last",
            empid:"IF050",
            email:"hr@if.com",
            password:"HR001",
            confirmPass:"HR001"
        })
        //FOR single document pass
        const result= await admin.save();       //await for waiting
    } catch (error) {
        console.log(error);
    }
}
// createDoc();
// createDoc2();
// UserSchema.methods.encryptPassword = function (password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
// };

// UserSchema.methods.validPassword = function (password) {
//     return bcrypt.compareSync(password, this.password);
// };
module.exports = usertable;