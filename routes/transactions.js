var express = require('express');
var router = express.Router();
const _ = require('lodash');
const moment = require('moment');


const Account = require('../models/accounts');
const Budget = require('../models/budgets');
const Transaction = require('../models/transactions');

/* GET home page. */

const period = moment().format('M[-]YY');
const currentDate = moment();

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

    transaction.save((result) => {
        res.redirect('/transactions/view');
    });
});

router.get('/view', (req, res) => {
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
         var incomesTable = incomes.map(income =>{
             return ({date: moment(income.date).add(1, 'days').format('DD/MMM/YYYY'), amount: formatMoney(income.amount), type: income.type, category: income.category, account: income.account, description: income.description});
         });

         var outcomesTable = outcomes.map(income =>{
            return ({date: moment(income.date).add(1, 'days').format('DD/MMM/YYYY'), amount: formatMoney(income.amount), type: income.type, category: income.category, account: income.account, description: income.description});
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
    Promise.all([
        Budget.find({ period }).select('type category').sort({ type: -1 }),
        Account.find().select('name').sort('type')
    ]).then(([budgets, accountsName]) => {
        var categories = Object.entries(budgets).map(budget => `${budget[1].type} ::: ${budget[1].category}`);
        var accounts = Object.values(accountsName).map(account => account.name);
        var obj = {
            title: 'Transacciones',
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


module.exports = router;
