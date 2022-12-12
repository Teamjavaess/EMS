var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var departmentschema = new Schema({
    
    portalname:{type:String, required: true},
    portalhead:{type: String},
    status:{type: String,required: true}
});
// applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},

module.exports = mongoose.model('department', departmentschema);