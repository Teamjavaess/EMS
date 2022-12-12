var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectschema = new Schema({

    projectname:{type:String,required: true},
    clientname:{type: String,required: true},
    projecthead:{type: String,required: true},
    projectcost:{type: String},
    server:{type: String},
});


module.exports = mongoose.model('project', projectschema);