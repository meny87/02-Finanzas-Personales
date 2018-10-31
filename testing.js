// const mongoose = require("./db/mongoose");
// const Account = require("./models/accounts");
// const Budget = require("./models/budgets");

// /*
// const account = new Account({
//     name:'Premia',
//     type: 'Debit',
//     balance: 1304.74
// });
// */

// // const budget = new Budget({
// //     category:'Vales Restaurantes',
// //     amount: 700,
// //     type: 'Income',
// //     period: '10-18'
// // });

// // budget.save()
// // .then(result => {
// //    return console.log("BUDGET: ", result);
// // })
// // .catch(err =>{
// //     console.log("ERROR:", err);
// // });

// const account = new Account({
//     name:'Efectivo',
//     type: 'Cash',
//     balance: 1000
// });

// account.save()
// .then(result => {
//     console.log("ACCOUNT: ", result);
// })
// .catch(err =>{
//     console.log("ERROR:", err);
// });



var transactions = [{
    type: 'Income',
    amount: 25000,
    category: 'Sueldo'
},
{
    type: 'Income',
    amount: 1,
    category: 'Sueldo'
},
{
    type: 'Outcome',
    amount: 1,
    category: 'Comida'
},
{
    type: 'Outcome',
    amount: 1,
    category: 'Comida'
},
{
    type: 'Outcome',
    amount: 150,
    category: 'Comida'
},
{
    type: 'Outcome',
    amount: 130,
    category: 'Comida'
},
{
    type: 'Income',
    amount: 33,
    category: 'Sueldo'
},
{
    type: 'Outcome',
    amount: 10000,
    category: 'Vivienda'
}];


var ic = ['Sueldo', 'Vales Despensa', 'Vales Restaurantes']
var oc = ['Comida', 'Regalos', 'Salud/Medico', 'Vivienda', 'Transporte']

console.log('TRANSCTIONS', transactions);

var outcomeBudgets = [{
    category: 'Comida',
    amount: 2100,
    type: 'Outcome',
    period: '10-18',
    __v: 0
},
{
    category: 'Regalos',
    amount: 1000,
    type: 'Outcome',
    period: '10-18',
    __v: 0
},
{
    category: 'Salud/Medico',
    amount: 500,
    type: 'Outcome',
    period: '10-18',
    __v: 0
},
{
    category: 'Vivienda',
    amount: 10000,
    type: 'Outcome',
    period: '10-18',
    __v: 0
},
{
    category: 'Transporte',
    amount: 500,
    type: 'Outcome',
    period: '10-18',
    __v: 0
}];




console.log('incomeCategories', outBudgetTable);

ic.forEach(i => {
    acm = 0;
    transactions.forEach((t) => {
        if (t.type === 'Income' && t.category === i) {
            acm += t.amount;
        }
    });
    return console.log(i + ' = ' + acm);
});

oc.forEach(i => {
    acm = 0;
    transactions.forEach((t) => {
        if (t.type === 'Outcome' && t.category === i) {
            acm += t.amount;
        }
    });
    return console.log(i + ' = ' + acm);
})


var acm = 0;



console.log('ACM', acm);