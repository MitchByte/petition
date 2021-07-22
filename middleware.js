module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userid) {
        return res.redirect("/petition");
    }
    next();
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userid && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }
    next();
};

module.exports.requireNoSignature = (req, res, next) => {
    if (req.session.sigId) {
        res.redirect("/petition/thanks");
    } else {
        next();
    }
};

module.exports.requireSignature = (req, res, next) => {
    if (!req.session.sigId) {
        return res.redirect("/petition");
    }
    next();
};
module.exports.requireNoProfile = (req,res,next) => {
    if (req.session.profile){
        return res.redirect("/update")
    };
    next();
}
module.exports.requireProfile = (req,res,next) => {
     if(!req.session.userid) {
        return res.redirect("/register");
    };
    next();
}