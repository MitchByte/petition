const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieParser = require('cookie-parser')


app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//do i have to use body-parser?
app.use(express.urlencoded({extended: false}));

app.use(cookieParser());
app.use((req,res,next)=> {
    //console.log("middleware in use urel", req.url);
    next();
})

app.use(express.static("./public"));


app.get("/", (req,res) => {
    res.redirect("/petition");
});

app.get("/petition", (req,res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.get("/petition/thanks", (req,res) => {
    db.getTotalNumber()
    .then((result) => {
        //console.log("number", result.rows[0].count);
        let num = result.rows[0].count;
        res.render("thanks", {
        layout:"main",
        number: num,
        });
    })
    .catch((err) => {
        console.log("error in GET/petition/thanks getTotalnumber ", err);
    });
});

app.get("/petition/signers", (req,res) => {
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
        console.log("error in GET/petition/signers getSigners ", err);
    })    
});

app.get("/logout", (req,res) => {
    //req.session = null;
    res.redirect("/petition");
})

app.post("/petition", (req,res) => {
    //console.log("req.body.firstname", req.body.firstname);
    //console.log("req.body.firstname", req.body.lastname);
    //console.log("req.body.hiddenfield", req.body.hiddenFieldforUrl);
    db.insertUserInput(req.body.firstname,req.body.lastname, req.body.hiddenFieldforUrl) 
    .then(() => {
        res.cookie("signed",true);
        res.redirect("/petition/thanks");
    })
    .catch((err) => {
        res.render("petition", {
            layout:"main",
            error:"Sorry something went wrong. Please try again!"
        });
        console.log("error in POST/petition : insertUserInput: ", err)
     })
    
    
})


app.listen(8080, () => {
    console.log("  SERVER IS LISTENING  ")
} )