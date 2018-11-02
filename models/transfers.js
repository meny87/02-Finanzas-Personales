var mongoose = require('mongoose');

var TransferSchema = mongoose.Schema({
    originAccount:{
        type: String,
        required: true
    },
    destinationAccount:{
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    period: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    }
});

var Transfer = mongoose.model('Transfer', TransferSchema);
module.exports = Transfer;