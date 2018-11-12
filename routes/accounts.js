var express = require('express');
var router = express.Router();
const _ = require('lodash');
const period = require('./utils/getPeriod');

const Account = require('../models/accounts');


function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.log(e)
    }
};


router.get('/create', (req, res) => {
    res.render('accounts/create', {
        title: 'Cuentas (Creación)',
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

router.get('/viewAll', (req, res) => {

    Promise.all([
        Account.find({type: 'Credit'}),
        Account.find({type : {$in: ['Debit', 'Cash']}})
    ]).then(([creditAccounts, debitAccounts]) => {


        console.log('DEBIT ACCOUNT::', debitAccounts);
        console.log('CREDIT ACCOUNT::', creditAccounts);
       
        debitAccounts = debitAccounts.map(account =>{
            return {
                _id: account.id,
                name: account.name,
                account: account.type,
                balance: formatMoney(account.balance)
            }
        });

        creditAccounts = creditAccounts.map(account =>{
            return {
                _id: account.id,
                name: account.name,
                account: account.type,
                balance: formatMoney(account.balance),
                dueDay: account.dueDay,
                paymentDay: account.paymentDay
            }
        });

        

        res.render('accounts/view', {
            title: 'Cuentas (Edición)',
            period,
            creditAccounts,
            debitAccounts
        });
    }).catch(e => {
        res.render('error', e);
    })
});

router.get('/update', (req, res) => {

    Account.findById(req.query.id, (err, account) =>{
        if(!err){
            console.log('ACCOUNT::', account);

            console.log('CREDIT::', req.query.credit);

            res.render('accounts/update', {
                title: 'Cuentas (Edición)',
                period,
                account,
                credit: req.query.credit
            });
        }
        else{
            console.log('ERROR::', err);
            res.render('error', err)
        }
    })
});

router.post('/update', (req, res) =>{
    var account =
    {
        name: req.body.name,
        type: req.body.type,
        balance: req.body.balance,
        dueDay: req.body.dueDay,
        paymentDay: req.body.paymentDay
    };

    console.log('ACCOUNT :: ', account);

    Account.findOneAndUpdate({ _id: req.body.id }, {
        $set: account
    }, {
            new: true
        }).then((t) => {
            res.redirect('/accounts/viewAll');
        }).catch((e) => {
            console.log('ERROR', e)
            res.render('error', { e });
        })
});

router.get('/delete', (req, res) => {
    res.render('accounts/delete', {
        title: 'Cuentas (Eliminación)',
        period
    });
});


module.exports = router;
