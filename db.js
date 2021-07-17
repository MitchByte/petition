const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition") //returns an object

//talking to the database
module.exports.insertUserInput = (first, last, sign) => {
    return db.query(`INSERT INTO signatures (firstname, lastname, signa) VALUES ($1, $2, $3) RETURNING id`,
                    [first, last, sign])         
}
module.exports.getTotalNumber = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`)

}

module.exports.getSigners = () => {
    return db.query(`SELECT firstname,lastname FROM signatures`)
}

module.exports.getSignature = (identifier)  => {
    return db.query(`SELECT signa FROM signatures WHERE id = ${identifier}`)
}