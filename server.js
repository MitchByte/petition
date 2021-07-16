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

app.post("/petition", (req,res) => {
    console.log("req body in post ", req.body);
    console.log("req param", req.param);
    //db.insertUserInput
    
})



app.listen(8080, () => {
    console.log("  SERVER IS LISTENING  ")
} )