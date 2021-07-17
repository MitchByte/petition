const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require('cookie-session');



app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//MIDDLEWARE
app.use(express.urlencoded({extended: false}));
app.use(cookieSession({
    secret: `set second cookie`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

/* DONT KNOW IF USEFULL
app.use((req,res,next) => {
    console.log("-------------");
    console.log("req.session",req.session);
    console.log("req.session signature id", req.session.sigId);
    next();
})
*/

app.use(express.static("./public"));

//GET
app.get("/", (req,res) => {
    res.redirect("/petition");
});

app.get("/petition", (req,res) => {
    res.render("petition", {
        layout: "main",
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
            //console.log("signers", result.rows);
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
app.post("/petition", (req,res) => {
    db.insertUserInput(req.body.firstname,req.body.lastname, req.body.hiddenFieldforUrl) 
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