var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeaveSchema = new Schema({

    applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    type: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    Day: {type:String, required: true},
    comment:{type: String}
});


module.exports = mongoose.model('Leave', LeaveSchema);