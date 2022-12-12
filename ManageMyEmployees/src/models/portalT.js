var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var protalschema = new Schema({
    portalname:{type:String, required: true},
    status:{type: String,required: true}
});


module.exports = mongoose.model('portal', protalschema);