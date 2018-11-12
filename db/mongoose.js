/*var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost:27017/Finances",{useNewUrlParser: true });

module.exports = {mongoose};*/

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser: true });

module.exports = {mongoose};
