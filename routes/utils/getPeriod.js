const moment = require('moment');

const currentMonth = (moment().month()+1) ;
const currentDay = moment().date();
const currentYear = moment().format('YY');
const periodMonth =  (currentDay >=13) ? (currentMonth): (currentMonth-1);

const period = `${periodMonth}-${currentYear}`;

module.exports = period;