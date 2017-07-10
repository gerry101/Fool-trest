var mongoose = require('mongoose');

var pinSchema = new mongoose.Schema({
   image  : String,
   author : {
       type: mongoose.Schema.Types.ObjectId,
       ref:  'User'
   },
   date   : {
       type    : Date,
       default : Date.now
   }
});

module.exports = mongoose.model('Pin', pinSchema);