const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition") //returns an object

//talking to the database
module.exports.insertUserInput = () => {
    `INSERT INTO signatures ($1, $2, $3, $4) VALUES (req.body.somthing)`;
}