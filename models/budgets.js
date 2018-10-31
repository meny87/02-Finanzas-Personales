var mongoose = require('mongoose');

var BudgetSchema = mongoose.Schema({
    category:{
        type: String,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    period:{
        type: 'String',
        required: true
    }
});

var Budget = mongoose.model('Budget', BudgetSchema);
module.exports = Budget;