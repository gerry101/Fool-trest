var middlewareObj = {};

// Login middleware
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.redirectTo = req.originalUrl;
    req.flash("error", "You need to sign in to do that");
    res.redirect("/auth/twitter");
}

module.exports = middlewareObj;