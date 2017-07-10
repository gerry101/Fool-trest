var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
   twitterId    : String,
   token        : String,
   displayName  : String,
   username     : String,
   image        : String,
   pins         : [
       {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'Pin'
       }
   ]
});

module.exports = mongoose.model('User', userSchema);