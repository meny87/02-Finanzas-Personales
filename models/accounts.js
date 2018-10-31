var mongoose = require('mongoose');

var AccountSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    dueDay:{
        type: Number,
    },
    paymentDay:{
        type: Number,
    }
});

var Account = mongoose.model('Account', AccountSchema);
module.exports = Account;