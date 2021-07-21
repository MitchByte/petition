const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require('cookie-session');
const bcrypt = require("./bcrypt")
const csurf = require('csurf');

if (process.env.NODE_ENV == 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'].startsWith('https')) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
};


app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//MIDDLEWARE
app.use(express.urlencoded({extended: false}));
app.use(cookieSession({
    secret: `set second cookie`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true
}));
/*
app.use(csurf(req.session.cookie=true));
app.use(function(req, res, next) {
    var token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
    res.locals.csrfToken = token;
    next();
}); 
*/

app.use(express.static("./public"));


//GET
app.get("/", (req,res) => {
    res.redirect("/register");
});

app.get("/register", (req,res) => {
    if(req.session.userid) {
        return res.redirect("/profile");
    };
    res.render("register", {
        layout:"main",
    });
});

app.get("/login", (req,res) => {
    console.log("req session in GET login",req.session);
    if(req.session.userid) {
        return res.redirect("/profile");
    };
    res.render("login", {
        layout:"main"
    });
});

app.get("/update", (req,res) => {
    console.log("IN GET/UPDATE");
    console.log("(!req.session.userid",!req.session.userid );
    if(!req.session.userid) {
        return res.redirect("/register");
    };
    let userid = req.session.userid;
    db.getUpdate(userid)
    .then((result) => {
        console.log("result get update: ", result.rows);
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


app.get("/petition", (req,res) => {

   if(req.session.sigId) {
        return res.redirect("/petition/thanks");
    };
    console.log("req session userid in petition: ",req.session.userid);
    res.render("petition", {
        layout:"main",
    });
});

app.get("/profile", (req,res) => {
    console.log("IN GET/PROFILE")
    if(!req.session.userid) {
        return res.redirect("/register");
    };
    if (req.session.profile){
        return res.redirect("/update")
    };
    res.render("profile", {
        layout:"main",
    });
});


app.get("/petition/thanks", (req,res) => {
    console.log("__________________________________");
    console.log("THANKS : ", req.body);
    console.log("req.sesson in thanks", req.session);

    if (req.session.sigId) {
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
    } else {
        return res.redirect("/petition");
    };   
});


app.get("/petition/signers", (req,res) => {
    if (req.session.sigId) {
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
    } else {
        return res.redirect("/petition");
    };       
});

app.get("/logout", (req,res) => {
    req.session = null;
    res.redirect("/register");
});

app.get("/petition/signers/:city", (req,res) => {
    console.log("request to /signers/city worked");
    console.log("SIGNERS BY CITY");
    console.log("req parameter", req.params);
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
app.post("/register", (req,res) => {
    console.log("__________________________________")
    console.log("REGISTER: ", req.body)
    req.session.firstname = req.body.firstname;
    req.session.lastname = req.body.lastname;
    req.session.email = req.body.email;
    console.log("req.body: ",req.body.firstname,req.body.lastname,req.body.email, req.body.password);
    //CHECK IF USER ALREADY EXISTS
    db.userLogin(req.body.email)
    .then((result) => {
        console.log("RESULT OF REGISTER LOOKING IF USER ALREADY EXISTS", result.rows);
        if (result.rows[0]) {
            console.log("(result.rows.length", result.rows.length);
            req.session = null;
            return res.redirect("/login");
        } else {
            bcrypt.hash(req.body.password)
            .then((result) => {
                db.userRegister(req.body.firstname,req.body.lastname,req.body.email,result)
                .then((result) => {    
                    //returns users(id)  
                    console.log("result rows", result.rows);    
                    req.session.userid = result.rows[0].id;
                    console.log("req session after register: ", req.session);
                    return res.redirect("/profile");
                })
                .catch((err) => {
                    res.render("register", {
                        layout:"main",
                        error: "Something went wrong. Please try again"
                    });
                    console.log("error in POST/register : userRegister ", err);
                });
            })
            .catch((err) => {
                console.log("error in POST/register : hashed Pw ", err);
                res.render("register", {
                    layout:"main",
                    error: "Something went wrong. Please try again"
                });
            });
        };
    })
    .catch((err)=> {
        res.render("register", {
            layout:"main",
            error: "Something went wrong. Please try again"
        });
        console.log("error in POST/register : userLogin ", err);
    })

    
})

app.post("/profile", (req,res) => {
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
    let lowerCity = city.toLowerCase();
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

app.post("/login", (req,res) => {
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
                return res.render("login", {
                    layout:"main",
                    error: "Something went wrong. Please try again"
                });
            };
            //console.log("req.session in POST login", req.session)
            db.getSignature(req.session.userid)
            .then((result) => {
                if (result.rows[0].id) {
                    req.session.sigId = result.rows[0].id;
                    return res.redirect("/petition/thanks");
                } else {
                    return res.redirect("/petition");
                }  
            })
            .catch((err) => {
                console.log("could not handle signature search in login",err);
                res.render("login", {
                    layout:"main",
                    error:"Something went wrong when login in!"
                });
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
            error: "Something went wrong. Please try again",
        });
    })
});

app.post("/update", (req,res)=> {
    let {firstname,lastname,email,password,age,city,homepage} = req.body;
    console.log(" REQUEST BODY UPDATE: ", req.body);
    if (homepage.length > 0 &&  !homepage.startsWith("https://") || homepage.length > 0 && !homepage.startsWith("http://"  )) {
        return res.render("update", {
            layout:"main",
            error: "Please use a valid URL"
        });
    };
    hompage = homepage || null;
    age = age || null;
    let lowerCity = city.toLowerCase();
    lowerCity = lowerCity || null;

    let userid = req.session.userid;
    if (password.length > 0) {
        bcrypt.hash(password)
        .then((hashedpw) => {
            //console.log("userid,firstname,lastname,email,hashedpw: ", userid,firstname,lastname,email)

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


app.post("/petition", (req,res) => {
    console.log("__________________________________")
    console.log("PETITION : ", req.session);
    db.insertUserSignature(req.body.hiddenFieldforUrl, req.session.userid) 
    .then((result) => {
        //returns id of signature
        console.log("Returning signature id in POST:", result.rows);
        req.session.sigId = result.rows[0].id;
        res.redirect("/petition/thanks");
    })
    .catch((err) => {
        res.render("petition", {
            layout:"main",
            error:"Sorry something went wrong. Please try again!"
        });
        console.log("error in POST/petition : insertUserSignature: ", err);
     });
})


app.post("/petition/thanks", (req,res) => {
    db.deleteSign(req.session.userid)
    .then(() => {
        console.log("ELETING SIGNATURES WORKED");
        req.session.sigId = null;
        return res.redirect("/petition");
    })
    .catch((err)=> {
        res.render("thanks", {
            layout:"main",
            error:"Sorry, deleting signature didnt work"
        });
        console.log("deleting signature didnt work", err);
    });
})


//LISTEN
app.listen(process.env.PORT || 8080, () => {
    console.log("  SERVER IS LISTENING  ");
} )