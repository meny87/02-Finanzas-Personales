var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost:27017/Finances",{useNewUrlParser: true });

module.exports = {mongoose};