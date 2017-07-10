var TwitterStrategy = require('passport-twitter'),
    session         = require('express-session'),
    methodOverride  = require('method-override'),
    User            = require('./models/user'),
    flash           = require('connect-flash'),
    bodyParser      = require('body-parser'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    express         = require('express'),
    app             = express();

var indexRoutes = require('./routes/index'),
    pinRoutes   = require('./routes/pins');

//fooltrest-pin
mongoose.connect(process.env.DATABASE_URL);

app.locals.moment = require('moment');
app.use(session({
    secret: 'Twitter fool pintrest',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'twitterId' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        if (!user.token) {
                            user.token       = token;
                            user.username    = profile.username;
                            user.displayName = profile.displayName;
                            user.image       = profile.photos[0].value;

                            user.save(function(err) {
                                if (err)
                                throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); 
                    } else {
                        var newUser         = new User();

                        newUser.twitterId   = profile.id;
                        newUser.token       = token;
                        newUser.username    = profile.username;
                        newUser.displayName = profile.displayName;
                        newUser.image       = profile.photos[0].value;

                        newUser.save(function(err) {
                            if (err)
                            throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                var user         = req.user; 

                user.twitterId   = profile.id;
                user.token       = token;
                user.username    = profile.username;
                user.displayName = profile.displayName;
                user.image       = profile.photos[0].value;

                user.save(function(err) {
                    if (err)
                    throw err;
                    return done(null, user);
                });
            }

        });
}));
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
app.use(flash());
app.use(function(req, res, next) {
   res.locals.currentUser = req.user;
   next();
});
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(indexRoutes);
app.use(pinRoutes);
app.set('view engine', 'ejs');

var port = process.env.PORT || 3000;
app.listen(port);