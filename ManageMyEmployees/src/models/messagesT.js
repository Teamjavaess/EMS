var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageschema = new Schema({
    applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    to:{type:String},
    comment:{type: String}
});


module.exports = mongoose.model('message', messageschema);