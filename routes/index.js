var express = require('express');
var router = express.Router();
const _ = require('lodash');
const moment = require('moment');


const Account = require('../models/accounts');
const Budget = require('../models/budgets');
const Transaction = require('../models/transactions');



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

router.get('/', function (req, res, next) {

  Promise.all([
    Account.find({ type: 'Debit' }),
    Account.find({ type: 'Credit' }),
    Account.findOne({ type: 'Cash' }),
    Account.find({}),
    Account.countDocuments({}),
    Budget.find({ type: 'Outcome', period }),
    Budget.find({ type: 'Income', period }),
    Transaction.find({ period }).select('type amount category account')
  ]).then(([debitAccounts, creditAccounts, cashAccounts, allAccounts, accountCount, outcomesBudget, incomesBudget, allTransactions]) => {

    var outBudgetTable = outcomesBudget.map((budget) => {
      acm = 0;
      allTransactions.forEach((transaction) => {
        if (transaction.type === 'Outcome' && transaction.category === budget.category) {
          acm += transaction.amount;
        }
      });
      return {
        cat: budget.category,
        prev: formatMoney(budget.amount),
        real: formatMoney(acm),
        diff: formatMoney(budget.amount - acm),
        prevNotFormat: budget.amount,
        realNotFormat: acm,
        diffNotFormat: budget.amount - acm
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

      var totalBalance = (account.type === 'Debit' ? account.balance + acmIncome - acmOutcome : account.balance - acmIncome + acmOutcome);

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

    var debitSumUp = 0;
    debitAccounts.forEach(account =>{
      if (account){
        debitSumUp += account.totalBalanceNoFormat;
      }
    });

    var creditSumUp = 0;
    creditAccounts.forEach(account =>{
      if (account){
        creditSumUp += account.totalBalanceNoFormat;
      }
    });

    var totalBalance = cashAccounts.balance + debitSumUp - creditSumUp;

    // creditAccounts = creditAccounts.map((account) => {

    //   return {
    //     name: account.name,
    //     type: account.type,
    //     balance: account.balance,
    //     dueDay: account.dueDay,
    //     paymentDate: account.paymentDate,
    //     formattedBalance: formatMoney(account.balance)
    //   }
    // });

    // debitAccounts = debitAccounts.map((account) => {
    //   return {
    //     name: account.name,
    //     type: account.type,
    //     balance: account.balance,
    //     dueDay: account.dueDay,
    //     paymentDate: account.paymentDate,
    //     formattedBalance: formatMoney(account.balance)
    //   }
    // });

    //console.log('CREDIT ACCOUNTS', creditAccounts);

    var summaryInfo = {
      totalIncome: formatMoney(_.sumBy(inBudgetTable, account => account.realNotFormat)),
      totalOutcome: formatMoney(_.sumBy(outBudgetTable, account => account.realNotFormat)),
      totalOutPrev: formatMoney(_.sumBy(outBudgetTable, element => element.prevNotFormat)),
      totalOutReal: formatMoney(_.sumBy(outBudgetTable, element => element.realNotFormat)),
      totalOutDiff: formatMoney(_.sumBy(outBudgetTable, element => element.diffNotFormat)),
      totalInPrev: formatMoney(_.sumBy(inBudgetTable, element => element.prevNotFormat)),
      totalInReal: formatMoney(_.sumBy(inBudgetTable, element => element.realNotFormat)),
      totalInDiff: formatMoney(_.sumBy(inBudgetTable, element => element.diffNotFormat))
    };

    var data = {
      title: 'Dashboard',
      debitAccounts,
      creditAccounts,
      cashAccounts: formatMoney(cashAccounts.balance),
      debitSumUp: formatMoney(debitSumUp),
      creditSumUp: formatMoney(creditSumUp),
      totalBalance: formatMoney(totalBalance),
      accountCount,
      outBudgetTable,
      inBudgetTable,
      period,
      summaryInfo
    };

    res.render('index', data);
  });

});

module.exports = router;
