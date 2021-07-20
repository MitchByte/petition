const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require('cookie-session');
const bcrypt = require("./bcrypt")


app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//MIDDLEWARE
app.use(express.urlencoded({extended: false}));
app.use(cookieSession({
    secret: `set second cookie`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
app.use(express.static("./public"));


//GET
app.get("/", (req,res) => {
    res.redirect("/register");
});

app.get("/register", (req,res) => {
    res.render("register", {
        layout:"main",
    })
});

app.get("/login", (req,res) => {
    console.log("req session in GET login",req.session);
    res.render("login", {
        layout:"main"
    })
})

app.get("/petition", (req,res) => {
    console.log("req session userid in petition: ",req.session.userid)
    res.render("petition", {
        layout:"main",
    });
});

app.get("/profile", (req,res) => {
    res.render("profile", {
        layout:"main",
    })
});

//WORK TO DO HERE

app.get("/signers/:city" ,(req,res) => {
    console.log("req parameter", req.params)
    const city = req.params.city;
    res.render("signersbycity",{
        city:city
    })
})

//dont know where the problem, get right signature id!!
app.get("/petition/thanks", (req,res) => {
    console.log("__________________________________")
    console.log("THANKS : ", req.body)
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
                    number,
                })
            })
            .catch((err) => {
                console.log("error in promise all")
            })
            
    } else {
        res.redirect("/petition");
    }    
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
        res.redirect("/petition");
    }       
});

app.get("/logout", (req,res) => {
    req.session = null;
    res.redirect("/petition");
});



//POST 
app.post("/register", (req,res) => {
    console.log("__________________________________")
    console.log("REGISTER: ", req.body)
    req.session.firstname = req.body.firstname;
    req.session.lastname = req.body.lastname;
    req.session.email =req.body.email;
    console.log("req.body: ",req.body.firstname,req.body.lastname,req.body.email, req.body.password);
    bcrypt.hash(req.body.password)
    .then((result) => {
        db.userRegister(req.body.firstname,req.body.lastname,req.body.email,result)
        .then((result) => {    
            //returns users(id)  
            console.log("result rows", result.rows)      
            req.session.userid = result.rows[0].id;
            console.log("req session after register: ", req.session)
            res.redirect("/petition");
        })
        .catch((err) => {
            res.render("register", {
                layout:"main",
                error: "Something went wrong. Please try again"
            })
            console.log("error in POST/register : userRegister ", err)
        })
    })
    .catch((err) => {
        console.log("error in POST/register : hashed Pw ", err);
        res.render("register", {
                layout:"main",
                error: "Something went wrong. Please try again"
            })
    });
})

app.post("/profile", (req,res) => {
    const {age,city,homepage} = req.body;
    console.log("age, city, homepage", age, city, homepage);
    if (!homepage.startsWith("https://")|| !homepage.startsWith("http://")) {
        res.render("/profile", {
            layout:"main",
            error: "Please use a valid URL"
        })
    }
    let userId = req.session.userid;
    let ageInt = parseInt(age);
    db.addProfile(userId,ageInt,city,homepage)

})

app.post("/login", (req,res) => {
    console.log("__________________________________")
    console.log("LOGIN : ", req.body)
    db.userLogin(req.body.email)
    .then((result) => {
        //result is SELECT * FROM users with re.body.email
        let userid = result.rows[0].id;
        //here cookie session
        req.session.firstname = result.rows[0].firstname;
        req.session.lastname = result.rows[0].lastname;
        req.session.userid = result.rows[0].id;
        req.session.email = result.rows[0].email;
        
        console.log("result after login:", result.rows)
        bcrypt.compare(req.body.password, result.rows[0].hashedpassword)
        .then((bool)=> {
            console.log("BOOL: ", bool);
            if (!bool) {
                res.render("login", {
                layout:"main",
                error: "Something went wrong. Please try again"
                })
            } 
            console.log("req.session in POST login", req.session)
            db.getSignature(userid)
            .then((result) => {
                if (result) {
                    res.redirect("/petition/thanks") 
                } else {
                    res.redirect("/petition")
                }  
            })
            .catch((err) => {
                console.log("could not handle signature search in login",err);
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
            })

    })

})




app.post("/petition", (req,res) => {
    console.log("__________________________________")
    console.log("PETITION : ", req.body)
    db.insertUserSignature(req.body.hiddenFieldforUrl, req.session.userid) 
    .then((result) => {
        //returns id of signature
        console.log("Returning signature id in POST:", result.rows)
        req.session.sigId = result.rows[0].id;
        res.redirect("/petition/thanks");
    })
    .catch((err) => {
        res.render("petition", {
            layout:"main",
            error:"Sorry something went wrong. Please try again!"
        });
        console.log("error in POST/petition : insertUserSignature: ", err)
     });

})



//LISTEN
app.listen(8080, () => {
    console.log("  SERVER IS LISTENING  ")
} )