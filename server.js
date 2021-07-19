const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require('cookie-session');
const bycript = require("./bcrypt")



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
    console.log("req session userid: ",req.session.userid);
    res.render("register", {
        layout:"main",
    })
});

app.get("/login", (req,res) => {
    console.log("req session userid: before login ",req.session.userid);
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


app.get("/petition/thanks", (req,res) => {
    console.log("req.sesson in thanks", req.session);
    if (req.session.sigId) {
        var signaUrl = db.getSignature(req.session.sigId)
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
            console.log("signers", result);
    
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
    //console.log("req.body: ",req.body.firstname,req.body.lastname,req.body.email, req.body.password);
    bycript.hash(req.body.password)
    .then((result) => {
        console.log("req.body.firstname,req.body.lastname,req.body.email,hashedPw:  ", req.body.firstname,req.body.lastname,req.body.email,result);
        db.userRegister(req.body.firstname,req.body.lastname,req.body.email,result)
        .then((result) => {
        console.log("result rows", result.rows);
        req.session.userid = result.rows[0].id;
        req.session.firstname = req.body.firstname;
        req.session.lastname = req.body.lastname;
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
    });
})

app.post("/petition", (req,res) => {
    db.insertUserSignature(req.session.firstname, req.session.lastname, req.body.hiddenFieldforUrl, req.session.userid) 
    .then((result) => {
        console.log("Returning result.rows[0].id in POST:", result.rows[0].id)
        req.session.sigId = result.rows[0].id;
        res.redirect("/petition/thanks");
    })
    .catch((err) => {
        res.render("petition", {
            layout:"main",
            error:"Sorry something went wrong. Please try again!"
        });
        console.log("error in POST/petition : insertUserInput: ", err)
     });

})



//LISTEN
app.listen(8080, () => {
    console.log("  SERVER IS LISTENING  ")
} )