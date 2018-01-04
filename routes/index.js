var User       = require('../models/user'),
    middleware = require('../middleware'),
    Pin        = require('../models/pin'),
    passport   = require('passport'),
    express    = require('express'),
    router     = express.Router();

// Landing page route
router.get('/', function(req, res) {
   res.render('landing');
});

// Homepage route
router.get('/pins', function(req, res) {
   // Find all pins from database
   Pin.find({}).populate('author').populate('likes').sort({date: -1}).exec(function(err, pins) {
       if(err) {
           return res.redirect('/');
       }
        res.render('home', {pins: pins});
   });  
});

// Profile route
router.get('/profile', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate('pins').exec(function(err, user) {
       if(err) {
           return res.redirect('/');
       }
        var userPins = user.pins;
        res.render('profile', {userPins: userPins});
    });
});

// User profile route
router.get('/profile/:id', function(req, res) {
   var userId = req.params.id;
   User.findById(userId).populate('pins').exec(function(err, user) {
      if(err) {
          return res.redirect('/');
      }
       var userPins = user.pins;
       res.render('pin/profile', {userPins: userPins});
   });
});

// Twitter auth route
router.get('/auth/twitter',
  passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/pins');
});

// Logout route
router.get('/logout', function(req, res) {
   req.logout();
   res.redirect('/');
});

module.exports = router;