var express = require('express');
var router = express.Router();
const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');


const Account = require('../models/accounts');
const Budget = require('../models/budgets');
const Transaction = require('../models/transactions');

/* GET home page. */

const period=require('./utils/getPeriod');

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

router.post('/register', (req, res) => {

    var transaction = new Transaction(
        {
            date: req.body.date,
            type: req.body.category.split(' ::: ')[0],
            amount: req.body.amount,
            account: req.body.account,
            category: req.body.category.split(' ::: ')[1],
            description: req.body.description,
            period
        }
    );

    console.log("TRANSACTION::", transaction);

    transaction.save((result) => {
        res.redirect('/transactions/view');
    });
});

router.get('/view', (req, res) => {
    var transType = req.query.type;

    Promise.all([
        Transaction.find({
            period,
            type: 'Income'
        }).sort({ date: -1 }),
        Transaction.find({
            period,
            type: 'Outcome'
        }).sort({ date: -1 })

    ]).then(([incomes, outcomes]) => {
        console.log("INCOMES", incomes)
        var incomesTable = incomes.map(income => {
            return ({ id: income._id, date: moment(income.date).add(1, 'days').format('DD/MMM/YYYY'), amount: formatMoney(income.amount), type: income.type, category: income.category, account: income.account, description: income.description });
        });

        var outcomesTable = outcomes.map(outcome => {
            return ({ id: outcome._id, date: moment(outcome.date).add(1, 'days').format('DD/MMM/YYYY'), amount: formatMoney(outcome.amount), type: outcome.type, category: outcome.category, account: outcome.account, description: outcome.description });
        });

        var obj = {
            incomesTable,
            outcomesTable,
            period,
            title: 'Detalles'
        }
        res.render('transactions/details', obj);
    });
});

router.get('/', (req, res, next) => {
    var transType = req.query.type;
    Promise.all([
        Budget.find({ period }).select('type category').sort({ type: -1 }),
        Account.find().select('name').sort('type')
    ]).then(([budgets, accountsName]) => {
        var categories = Object.entries(budgets).map(budget => {
            if (budget.category === transType) {
                return `${budget[1].type} ::: ${budget[1].category}`;
            }
        });

        var accounts = Object.values(accountsName).map(account => account.name);
        var obj = {
            title: 'Detalles de Transacciones - ' + transType,
            period,
            currentDate,
            categories,
            accounts
        };
        // console.log("OBJ::", obj)
        res.render('transactions/create', obj);
    }).catch((e) => {
        res.render('error', { e })
    });
});


router.get('/edit', (req, res, next) => {
    var id = mongoose.Types.ObjectId(req.query.id);

    Promise.all([
        Budget.find({ period }).select('type category').sort({ type: -1 }),
        Account.find().select('name').sort('type'),
        Transaction.findById(id)
    ]).then(([budgets, accountsName, transaction]) => {
        var transactionItem = `${transaction.type} ::: ${transaction.category}`
        var categories = Object.entries(budgets).map(budget => {
            var selectItem = `${budget[1].type} ::: ${budget[1].category}`;
            if (selectItem !== transactionItem) {
                return selectItem;
            }
        });

        var accounts = Object.values(accountsName).map(account => {
            if (transaction.account !== account.name) {
                return account.name;
            }
        });

        // console.log("TRANSACTION::", transaction);
        // console.log("CATEGORIES::", categories);
        // console.log("ACCOUNTS::", accounts);


        var obj = {
            id,
            title: 'Detalles de Transacciones - Edit',
            period,
            categories,
            accounts,
            date: moment(transaction.date).add(1, 'days').format('DD/MM/YYYY'),
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            account: transaction.account,
            description: transaction.description,
            transactionItem
        };
        res.render('transactions/edit', obj);
    })
        .catch(e => {
            console.log("ERROR::", e)
            res.render('error', { e })
        });

});

router.post('/update', (req, res, next) => {
    //2018-10-13T00:00:00.000Z
    var dateArray = req.body.date.split('/');
    var transactionDate = `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}T00:00:00.000Z`;

    var transaction =
    {
        date: transactionDate,
        type: req.body.category.split(' ::: ')[0],
        amount: req.body.amount,
        account: req.body.account,
        category: req.body.category.split(' ::: ')[1],
        description: req.body.description,
        period
    };


    Transaction.findOneAndUpdate({ _id: req.body.id }, {
        $set: transaction
    }, {
            new: true
        }).then((t) => {
            res.redirect('/transactions/view');
        }).catch((e) => {
            console.log('ERROR', e)
            res.render('error', { e });
        })

});

router.get('/credit', (req, res, next) => {

    Promise.all([
        Account.find({ type: { $in: ['Debit', 'Cash'] } }).select('name'),
        Account.find({ type: 'Credit' }).select('name')
    ]).then(([debitAccounts, creditAccounts]) => {

        debitAccounts = debitAccounts.map(account => account.name);
        creditAccounts = creditAccounts.map(account => account.name);


        console.log("debitAccounts::", debitAccounts);
        console.log("creditAccounts::", creditAccounts);

        var obj = {
            title: 'Detalles de Transacciones - CREDIT',
            period,
            debitAccounts,
            creditAccounts
        };


        res.render('transactions/credit', obj);


    }).catch(e => {
    });
});


router.get('/cash', (req, res, next) => {

    Promise.all([
        Account.find({ type: { $in: ['Debit'] } }).select('name')
    ]).then(([debitAccounts, creditAccounts]) => {

        debitAccounts = debitAccounts.map(account => account.name);

        console.log("debitAccounts::", debitAccounts);
        console.log("creditAccounts::", creditAccounts);

        var obj = {
            title: 'Detalles de Transacciones - CASH',
            period,
            debitAccounts
        };
        res.render('transactions/cash', obj);
    }).catch(e => {
        console.log('ERROR::', e)
    });
});

router.post('/saveCCPayment', (req, res) => {

    var incomeTransaction = new Transaction(
        {
            date: req.body.date,
            type: 'Income',
            amount: req.body.amount,
            account: req.body.incomeAccount,
            category: 'Pago TC',
            description: req.body.description,
            period
        }
    );

    var outcomeTransaction = new Transaction(
        {
            date: req.body.date,
            type: 'Outcome',
            amount: req.body.amount,
            account: req.body.outcomeAccount,
            category: 'Pago TC',
            description: req.body.description,
            period
        }
    );

    console.log("INCOME TRANSACTION::", incomeTransaction);
    console.log("OUTCOME TRANSACTION::", outcomeTransaction);

    incomeTransaction.save((resultIncome) => {
        outcomeTransaction.save((resultOutcome) => {
            res.redirect('/transactions/view');
        })
    });
});


router.post('/saveCashTransfer', (req, res) => {

    var incomeTransaction = new Transaction(
        {
            date: req.body.date,
            type: 'Income',
            amount: req.body.amount,
            account: 'Cash',
            category: 'Retiro Efectivo',
            description: req.body.description,
            period
        }
    );

    var outcomeTransaction = new Transaction(
        {
            date: req.body.date,
            type: 'Outcome',
            amount: req.body.amount,
            account: req.body.account,
            category: 'Retiro Efectivo',
            description: req.body.description,
            period
        }
    );

    console.log("INCOME TRANSACTION::", incomeTransaction);
    console.log("OUTCOME TRANSACTION::", outcomeTransaction);

    incomeTransaction.save((resultIncome) => {
        outcomeTransaction.save((resultOutcome) => {
            res.redirect('/transactions/view');
        })
    });
});

module.exports = router;
