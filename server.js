const express = require("express");
const app = express();
const db = require("./db.js");
const hb = require("express-handlebars");
//HERE: const render_data = require("./data.json")

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//do i have to use body-parser?
app.use(express.urlencoded({extended: false}));
app.use(express.static("./public"));



app.get("/", (req,res) => {
    console.log("get request to / route happend")
});
app.get("/petition", (req,res) => {
    res.render("petition", {
        layout: null,
    });
    console.log("request body in get", req.body)
});

app.get("/petition/signed", (req,res) => {
    res.render("thanks", {
        layout:null,
    })
});

app.get("/petition/signers", (req,res) => {
    res.render("signers", {
        layout:null,
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
    console.log("req.body.canvas", req.body.canvas);
    //console.log("req param", req.param);
    db.insertUserInput(req.body.firstname,req.body.lastname, req.body.canvas)
    
})



app.listen(8080, () => {
    console.log("  SERVER IS LISTENING  ")
} )