var express = require('express');
var router = express.Router();
const _ = require('lodash');
const period=require('./utils/getPeriod');

const Account = require('../models/accounts');

/* GET home page. */

router.get('/create', (req, res) => {
    res.render('accounts/create', {
        title: 'Cuentas',
        period
    });
});

router.post('/register', (req, res) => {

    var account = new Account(
        {
            name: req.body.name,
            type: req.body.type,
            balance: req.body.balance,
            dueDay: req.body.dueDay,
            paymentDay: req.body.paymentDay
        }
    );

    console.log('ACCOUNT::', account);

    account.save((result) => {
        console.log('RESULT::', result);
        res.redirect('/');
    }).catch((e) => {
        res.render('error', { e })
    });

});


module.exports = router;
