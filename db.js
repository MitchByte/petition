const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition") //returns an object

//talking to the database
module.exports.insertUserInput = (first, last, sign) => {
    return db.query(`INSERT INTO signatures (firstname, lastname, signature) 
                    VALUES (firstname = $1, lastname = $2, signature = $3)`,
                    [first, last, sign])
                    .then((result) => {
                        console.log(result.rows)
                    })
                    .catch((err) => {
                        console.log("error in insertUserInput: ", err)
                    })
}
