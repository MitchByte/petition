const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//do i have to use body-parser?
app.use(express.urlencoded({extended: false}));
app.use(express.static("./public"));


app.get("/", (req,res) => {
    res.redirect("/petition")
    console.log("get request to / route happend")
});

app.get("/petition", (req,res) => {
    res.render("petition", {
        layout: "main",
    });
    console.log("request body in get", req.body)
});

app.get("/petition/thanks", (req,res) => {
    res.render("thanks", {
        layout:"main",
    })
});

app.get("/petition/signers", (req,res) => {
    res.render("signers", {
        layout:"main",
    })
});

app.get("/logout", (req,res) => {
    //req.session = null;
    res.redirect("/")
})

app.post("/petition", (req,res) => {
    console.log("req body in post ", req.body);
    console.log("req.body.firstname", req.body.firstname);
    console.log("req.body.firstname", req.body.lastname);
    console.log("req.body.hiddenfield", req.body.hiddenFieldforUrl);
    db.insertUserInput(req.body.firstname,req.body.lastname, req.body.hiddenFieldforUrl) 
    .then(() => {
        res.redirect("/petition/thanks")
    })
    .catch((err) => {
        res.render("petition", {
            layout:"main",
            error:"error is true"
        })
        console.log("error in insertUserInput: ", err)
     })
    
    
})


app.listen(8080, () => {
    console.log("  SERVER IS LISTENING  ")
} )