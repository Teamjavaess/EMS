var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventschema = new Schema({
    fordepartment:{type:String, required: true},
    topic:{type: String,required: true}
});


module.exports = mongoose.model('event', eventschema);