var mongoose = require('mongoose');

var TransactionSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    account: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    period: {
        type: String,
        required: true
    }
});

var Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;