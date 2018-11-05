var express = require('express');
var router = express.Router();
const _ = require('lodash');
const moment = require('moment');

const Budget = require('../models/budgets');

const period=require('./utils/getPeriod');

router.get('/create', (req, res) => {
    res.render('budgets/create', {
        title: 'Presupuestos',
        type: req.query.type,
        period
    });
});

router.post('/create', (req, res) => {
    var budget = new Budget({
        category: req.body.category,
        amount: req.body.amount,
        type: req.body.type,
        period
    });

    console.log('BUDGET::', budget);

    budget.save((result) =>{
        res.redirect('/');
    });
   

});


module.exports = router;
