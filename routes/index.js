var User       = require('../models/user'),
    middleware = require('../middleware'),
    Pin        = require('../models/pin'),
    passport   = require('passport'),
    express    = require('express'),
    router     = express.Router();

router.get('/', function(req, res) {
   Pin.find({}).populate('author').populate('likes').sort({date: -1}).exec(function(err, pins) {
       if(err) {
           console.log('error');
           return res.redirect('/');
       }
        res.render('home', {pins: pins});
   }); 
});

router.get('/profile', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate('pins').exec(function(err, user) {
       if(err) {
           console.log('error');
           return res.redirect('/');
       }
        var userPins = user.pins;
        res.render('profile', {userPins: userPins});
    });
});

router.get('/profile/:id', function(req, res) {
   var userId = req.params.id;
   User.findById(userId).populate('pins').exec(function(err, user) {
      if(err) {
          console.log('error');
          return res.redirect('/');
      }
       var userPins = user.pins;
       res.render('pin/profile', {userPins: userPins});
   });
});

router.get('/auth/twitter',
  passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
   req.logout();
   res.redirect('/');
});

module.exports = router;