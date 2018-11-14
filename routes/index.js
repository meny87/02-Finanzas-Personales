var express = require('express');
var router = express.Router();
const _ = require('lodash');

const Account = require('../models/accounts');
const Budget = require('../models/budgets');
const Transaction = require('../models/transactions');

const period = require('./utils/getPeriod');
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

router.get('/update', (req, res) => {
  Budget.findById(req.query.id, (err, budget) => {
    if (err) {
      res.render('error', err);
    } else {
      var data = {
        title: 'Editar Categoría',
        period,
        budget
      };

      res.render('./budgets/update', data);
    }
  });

});

router.post('/update', (req, res) => {

  var budget = {
    category: req.body.category,
    amount: req.body.amount
  }

  console.log('BUDGET::', budget);

  Budget.findOneAndUpdate({ _id: req.body.id }, { $set: budget }, { new: true }
  ).then(t => {
    console.log('T::', t);
    res.redirect('/');
  }).catch(err => {
    console.log('ERROR ::', err);
    res.render('error', err);
  });
});

router.get('/delete', (req, res) => {
  Budget.findById(req.query.id, (err, budget) => {
    if (err) {
      res.render('error', err);
    } else {
      budget = {
        id : budget._id,
        category: budget.category,
        amount: formatMoney(budget.amount),
        type: budget.type
      };

      var data = {
        title: 'Eliminar Categoría',
        period,
        budget
      };

      res.render('./budgets/delete', data);
    }
  });
});

router.post('/delete', (req, res) => {
  console.log('BODY:::', req.body);
  Budget.findByIdAndRemove(req.body.id, (err, doc) => {
    if (!err) {
      console.log('DOCUMENT::', doc);
      res.redirect('/');
    }
    else {
      res.redirect('error', err);
    }
  });

});

router.get('/', function (req, res, next) {

  Promise.all([
    Account.find({ type: 'Debit' }),
    Account.find({ type: 'Credit' }),
    Account.findOne({ type: 'Cash' }),
    Account.find({}),
    Account.countDocuments({}),
    Budget.find({ type: 'Outcome', period }),
    Budget.find({ type: 'Income', period }),
    Budget.find({ type: 'Transfer', period }),
    Transaction.find({ period }).select('type amount category account')
  ]).then(([debitAccounts, creditAccounts, cashAccounts, allAccounts, accountCount, outcomesBudget, incomesBudget, transfersBudget, allTransactions]) => {

    var outBudgetTable = outcomesBudget.map((budget) => {
      acm = 0;
      allTransactions.forEach((transaction) => {
        if (transaction.type === 'Outcome' && transaction.category === budget.category) {
          acm += transaction.amount;
        }
      });

      var perc = Math.ceil((acm * 100) / budget.amount);

      return {
        id: budget._id,
        cat: budget.category,
        prev: formatMoney(budget.amount),
        real: formatMoney(acm),
        diff: formatMoney(budget.amount - acm),
        perc,
        prevNotFormat: budget.amount,
        realNotFormat: acm,
        diffNotFormat: budget.amount - acm,
        alert: perc <= 100
      };
    });

    var inBudgetTable = incomesBudget.map((budget) => {
      acm = 0;
      allTransactions.forEach((transaction) => {
        if (transaction.type === 'Income' && transaction.category === budget.category) {
          acm += transaction.amount;
        }
      });
      return {
        id: budget._id,
        cat: budget.category,
        prev: formatMoney(budget.amount),
        real: formatMoney(acm),
        diff: formatMoney(budget.amount - acm),
        prevNotFormat: budget.amount,
        realNotFormat: acm,
        diffNotFormat: budget.amount - acm
      };
    });


    allAccounts = allAccounts.map((account) => {
      acmIncome = 0;
      acmOutcome = 0;
      allTransactions.forEach((transaction) => {
        if (transaction.type === 'Income' && transaction.account === account.name) {
          acmIncome += transaction.amount;
        }
      });

      allTransactions.forEach((transaction) => {
        if (transaction.type === 'Outcome' && transaction.account === account.name) {
          acmOutcome += transaction.amount;
        }
      });


      var totalBalance = 0;

      if (account.type === 'Debit') {
        totalBalance = account.balance + acmIncome - acmOutcome;
      } else if (account.type === 'Credit') {
        totalBalance = account.balance - acmIncome + acmOutcome;
      } else {
        totalBalance = account.balance + acmIncome - acmOutcome;
      };


      return {
        name: account.name,
        type: account.type,
        balance: account.balance,
        dueDay: account.dueDay,
        paymentDay: account.paymentDay,
        formattedBalance: formatMoney(account.balance),
        acmIncome: formatMoney(acmIncome),
        acmOutcome: formatMoney(acmOutcome),
        totalBalance: formatMoney(totalBalance),
        totalBalanceNoFormat: totalBalance
      };
    });

    creditAccounts = allAccounts.map(creditAccount => {
      if (creditAccount.type === 'Credit') {
        return creditAccount;
      };
    });

    debitAccounts = allAccounts.map(debitAccount => {
      if (debitAccount.type === 'Debit') {
        return debitAccount;
      }
    });

    cashAccounts = allAccounts.map(account => {
      if (account.type === 'Cash') {
        return account;
      }
    });

    cashAccounts = cashAccounts.map(account => {
      if (account) {
        return account;
      }
    });

    //console.log('CASH ACCOUNTS::', cashAccounts);

    var debitSumUp = 0;
    debitAccounts.forEach(account => {
      if (account) {
        debitSumUp += account.totalBalanceNoFormat;
      }
    });

    var creditSumUp = 0;
    creditAccounts.forEach(account => {
      if (account) {
        creditSumUp += account.totalBalanceNoFormat;
      }
    });

    var cashSumUp = 0;
    cashAccounts.forEach(account => {
      if (account) {
        cashSumUp += account.totalBalanceNoFormat;
      }
    });

    var grandTotalBalance = cashSumUp + debitSumUp - creditSumUp;

    var summaryInfo = {
      totalIncome: formatMoney(_.sumBy(inBudgetTable, account => account.realNotFormat)),
      totalOutcome: formatMoney(_.sumBy(outBudgetTable, account => account.realNotFormat)),
      totalOutPrev: formatMoney(_.sumBy(outBudgetTable, element => element.prevNotFormat)),
      totalOutReal: formatMoney(_.sumBy(outBudgetTable, element => element.realNotFormat)),
      totalOutDiff: formatMoney(_.sumBy(outBudgetTable, element => element.diffNotFormat)),
      totalInPrev: formatMoney(_.sumBy(inBudgetTable, element => element.prevNotFormat)),
      totalInReal: formatMoney(_.sumBy(inBudgetTable, element => element.realNotFormat)),
      totalInDiff: formatMoney(_.sumBy(inBudgetTable, element => element.diffNotFormat)),
      totalSaving: formatMoney((_.sumBy(inBudgetTable, account => account.realNotFormat)) - (_.sumBy(outBudgetTable, account => account.realNotFormat))),
      totalSavingPerc: (100 - ((_.sumBy(outBudgetTable, account => account.realNotFormat)) * 100 / (_.sumBy(inBudgetTable, account => account.realNotFormat)))).toFixed(2)
    };

    var data = {
      title: 'Dashboard',
      debitAccounts,
      creditAccounts,
      cashAccounts,
      debitSumUp: formatMoney(debitSumUp),
      creditSumUp: formatMoney(creditSumUp),
      cashSumUp: formatMoney(cashSumUp),
      accountCount,
      outBudgetTable,
      inBudgetTable,
      period,
      summaryInfo,
      grandTotalBalance: formatMoney(grandTotalBalance)
    };

    res.render('index', data);
  });

});

module.exports = router;
