const mongoose= require("mongoose");
mongoose.connect("mongodb://localhost:27017/ManageMyEmployees").then(()=>{console.log(`DB connection successfull`)})
.catch((e)=>{console.log(e)});