const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require('cookie-session');
const bcrypt = require("./bcrypt");
const csurf = require('csurf');
const {
    requireLoggedOutUser,
    requireLoggedInUser,
    requireNoSignature,
    requireSignature,
    requireNoProfile
} = require("./middleware");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//MIDDLEWARE
if (process.env.NODE_ENV == 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'].startsWith('https')) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
};

app.use(express.urlencoded({extended: false}));
app.use(cookieSession({
    secret: `set second cookie`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true
}));
/*
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});
*/
app.use(express.static("./public"));

app.use(requireLoggedInUser);

//GET
app.get("/", (req,res) => {
    res.redirect("/register");
});

app.get("/register", requireLoggedOutUser ,(req,res) => {
    res.render("register", {
        layout:"main",
    });
});

app.get("/login", requireLoggedOutUser, (req,res) => {
    console.log("req session in GET login",req.session);
    res.render("login", {
        layout:"main"
    });
});
app.get("/update", (req,res) => {
    console.log("IN GET/UPDATE");
    db.getUpdate(req.session.userid)
    .then((result) => {
        console.log("result get update: ", result.rows[0]);
        let update = result.rows;
        res.render("update", {
            layout:"main",
            update
        });
    })
    .catch((err) => {
        console.log("error in GET/update", err);
        res.render("update", {
            layout:"main",
            error: "Something went wrong. Please try again"
        });
    });
});


app.get("/petition", requireNoSignature,(req,res) => {
    res.render("petition", {
        layout:"main",
    });
});

app.get("/profile", requireNoProfile, (req,res) => {
    res.render("profile", {
        layout:"main",
    });
});


app.get("/petition/thanks", requireSignature, (req,res) => {
    var signaUrl = db.getSignature(req.session.userid)
    .then((result) => {
        return result.rows[0].signa;
    })
    .catch((err) => {
        console.log("error in GET/petition/thanks : getSignature ", err);
    });

    var total = db.getTotalNumber()
    .then((result) => {
        return result.rows[0].count;
    })
    .catch((err) => {
        console.log("error in GET/petition/thanks : getTotalnumber ", err);
    });

    Promise.all([signaUrl,total])
    .then((results) => {
        var signature = results[0];
        var number = results[1];
        res.render("thanks",{
            layout:"main",
            signature,
            number
        })
    })
    .catch((err) => {
        console.log("error in promise all")
    }); 
       
});


app.get("/petition/signers",  requireSignature, (req,res) => {
    db.getSigners()
    .then((result) => {
        console.log("signers: ", result.rows);
        let signers = result.rows;
        res.render("signers", {
            layout:"main",
            signers,
        });
    })
    .catch((err) => {
        console.log("error in GET/petition/signers : getSigners ", err);
    }); 
          
});

app.get("/logout", (req,res) => {
    req.session = null;
    res.redirect("/login");
});

app.get("/delete", (req,res)=> {
    res.render("delete", {
        layout:"main"
    }) 
})

app.get("/petition/signers/:city",requireSignature, (req,res) => {
    let city = req.params.city;
    db.getSignersByCity(city)
    .then((result) => {
        let capitalCity =  city.charAt(0).toUpperCase() + city.slice(1);
        console.log("get singners by city",result.rows);
        let signersbycity = result.rows;
        res.render("signersbycity",{
            layout:"main",
            city: capitalCity,
            signersbycity
        });
    })
    .catch((err) => {
        res.render("signersbycity",{
            layout:"main",
            error:"Unfortunatly we cannot show you the signers by city"
        });
    });
})


//POST 

app.post("/register",requireLoggedOutUser, (req,res) => {
    if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password) {
        return res.render("register",{
            layout:"main",
            error: "You missed some of the required input fields."
        });
    };

    bcrypt.hash(req.body.password)
    .then((result) => {
        return db.userRegister(req.body.firstname,req.body.lastname,req.body.email,result)
        .then((result) => {    
            //returns users(id)  
            console.log("result rows", result.rows);    
            req.session.userid = result.rows[0].id;
            req.session.firstname = req.body.firstname;
            req.session.lastname = req.body.lastname;
            console.log("req session after register: ", req.session);
            res.redirect("/profile");
        })
        .catch((err) => {
            res.render("register", {
                layout:"main",
                error: "Something went wrong while register. Please try again."
            });
            console.log("error in POST/register : userRegister ", err);
        });
    })
    .catch((err) => {
        console.log("error in POST/register : hashed Pw ", err);
        res.render("register", {
            layout:"main",
            error: "Something went wrong with your password. Please try again."
        });
    }); 
})


app.post("/profile",requireNoProfile, (req,res) => {
    console.log("__________________________________");
    console.log("PROFILE- session: ",req.session);
    let {age,city,homepage} = req.body;
    
    //console.log("req body if null?",typeof(req.body.age),typeof(req.body.city),typeof(req.body.homepage));
    //homepage
    
    if (homepage =="") {
        homepage = null;
    } else if (!homepage.startsWith("https://") || !homepage.startsWith("http://")) {
            return res.render("profile", {
                layout:"main",
                error: "Please use a valid URL"
            });
    };
    //age
    let ageInt = parseInt(age);;
    if(isNaN(ageInt)){
        ageInt = null;
    };
    //city
    let lowerCity = city.charAt(0).toUpperCase() + city.slice(1);
    if (lowerCity == "") {
        lowerCity = null;
    };

    console.log("age, city, homepage", ageInt, lowerCity, homepage);
    db.addProfile(req.session.userid, ageInt, lowerCity, homepage)
    .then(()=> {
        req.session.profile = true;
        return res.redirect("/petition");
    })
    .catch((err) => {
        res.render("profile", {
            layout:"main",
            error:"Please use a valid input"
        });
        console.log("err in POST profile", err);
    });

})

app.post("/login",requireLoggedOutUser, (req,res) => {
    console.log("__________________________________");
    console.log("LOGIN : ", req.body);
    db.userLogin(req.body.email)
    .then((result) => {
        console.log("LOGIN RESULTS WITH ")
        //result is SELECT * FROM users with re.body.email
        let userid = result.rows[0].id;
        //here cookie session
        req.session.firstname = result.rows[0].firstname;
        req.session.lastname = result.rows[0].lastname;
        req.session.userid = result.rows[0].id;
        req.session.email = result.rows[0].email;

        console.log("result after userlogin:", result.rows);
        bcrypt.compare(req.body.password, result.rows[0].hashedpassword)
        .then((bool)=> {
            if (!bool) {
                req.session = null;
                return res.render("login", {
                    layout:"main",
                    error: "Your password is incorrect!"
                });
            };
            console.log("BEFORE GET SIGNATURE userid: ",req.session.userid )
            db.getSignature(req.session.userid)
            .then((result) => {
                //maybe when no sign there is no result so it is an error
                if (result.rows[0].id) {
                    req.session.sigId = result.rows[0].id;
                    return res.redirect("/petition/thanks");
                } 
            })
            .catch((err) => {
                return res.redirect("/petition");
                /*console.log()
                req.session = null;
                console.log("could not handle signature search in login",err);
                res.render("login", {
                    layout:"main",
                    error:"Something went wrong when logging in! Try again later."
                });*/
            });
        })
        .catch((err) => {
            console.log("error in boolean: ", err)  
        });
    })
    .catch((err) => {
        console.log("error in POST/login", err);
        res.render("login", {
            layout:"main",
            error: "We couldn't find your account. Please register first!",
        });
    })
});

app.post("/update", (req,res)=> {
    let {firstname,lastname,email,password,age,city,homepage} = req.body;
    /*if (homepage.length > 0){
        if (!homepage.startsWith("https://") || !homepage.startsWith("http://"  )) {
            return res.render("update", {
            layout:"main",
            error: "Please use a valid URL"
        });
        }
    };*/
    hompage = homepage || null;
    age = age || null;
    let lowerCity = city.toLowerCase();
    lowerCity = lowerCity || null;

    let userid = req.session.userid;
    if (password.length > 0) {
        bcrypt.hash(password)
        .then((hashedpw) => {
            db.addUpdateUsersPw(userid,firstname,lastname,email,hashedpw)
            .then(()=> {
                db.addUpdateProfiles(userid,age,lowerCity,homepage)
                .then(()=> {
                    return res.redirect("/petition");
                })
                .catch((err)=> {
                    res.render("update", {
                        layout:"main",
                        error:"something went wrong"
                    });
                    console.log("error in addupdateprofiles",err);
                });
            })
            .catch((err) => {
                res.render("update", {
                    layout:"main",
                    error:"something went wrong"
                });
                console.log("error in POST/update in addUpdateUsers", err);
            });
        })        
        .catch((err) => {
            res.render("update", {
                layout:"main",
                error:"something went wrong"
            });
            console.log("error in POST/update hash", err);
        });
    } else {
        db.addUpdateUsers(userid,firstname,lastname,email)
        .then(()=> {
            db.addUpdateProfiles(userid,age,lowerCity,homepage)
            .then(()=> {
                return res.redirect("/petition");
            })
            .catch((err)=> {
                res.render("update", {
                    layout:"main",
                    error:"something went wrong"
                });
                console.log("error in addupdateprofiles", err);
            })
        })
        .catch((err) => {
            res.render("update", {
                layout:"main",
                error:"something went wrong"
            });
            console.log("error in POST/update in addUpdateUsers", err);
        });
    }
});


app.post("/petition", requireNoSignature,(req,res) => {
    db.insertUserSignature(req.body.hiddenFieldforUrl, req.session.userid) 
    .then((result) => {
        //returns id of signature
        console.log("Returning signature id in POST:", result.rows);
        req.session.sigId = result.rows[0].id;
        return res.redirect("/petition/thanks");
    })
    .catch((err) => {
        res.render("petition", {
            layout:"main",
            error:"Sorry something went wrong. We could not save your signature. Please try again!"
        });
        console.log("error in POST/petition : insertUserSignature: ", err);
     });
})


app.post("/petition/thanks",requireSignature, (req,res) => {
    db.deleteSign(req.session.userid)
    .then(() => {
        console.log("DELETING SIGNATURES WORKED");
        req.session.sigId = null;
        return res.redirect("/petition");
    })
    .catch((err)=> {
        res.render("thanks", {
            layout:"main",
            error:"Sorry, deleting signature didn't work."
        });
        console.log("deleting signature didnt work", err);
    });
})

app.post("/delete", (req,res) => {
    db.deleteSign(req.session.userid)
    .then(()=> {
        db.deleteProfile(req.session.userid)
        .then(()=> {
            db.deleteUser(req.session.userid)
            .then(()=> {
                req.session = null;
                console.log("req.session after deleting", req.session)
                res.render("delete",{
                    layout:"main",
                    message:"You deleted your account successfully! Sorry we could not impress you with our vision!"
                })
            })
            .catch((err)=> {
                console.log("deleteUser didnt work",err);
                res.render("delete", {
                    layout:"main",
                    error: "Sorry, an error occured! Please write an email to creative@city.com to get your account deleted!"
                });
            });
        })
        .catch((err) => {
            console.log("deleteProfiels didnt work",err);
            res.render("delete", {
                layout:"main",
                error: "Sorry, an error occured! Please write an email to creative@city.com to get your account deleted!"
            });

        });
    })
    .catch((err) => {
        console.log("deleteSign didnt work",err);
        res.render("delete", {
            layout:"main",
            error: "Sorry, an error occured! Please write an email to creative@city.com to get your account deleted!"
        });
    })
})


//LISTEN
app.listen(process.env.PORT || 8080, () => {
    console.log("  SERVER IS LISTENING  ");
} )