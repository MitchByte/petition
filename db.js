const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition") //returns an object

//register user, get back id
module.exports.userRegister = (first, last, email, hashedpw) => {
    return db.query(`INSERT INTO users (firstname, lastname, email, hashedpassword) VALUES ($1, $2, $3, $4) RETURNING id`,
    [first, last, email, hashedpw])
}

//SELECT to find all the data for a user in the users table by their email address.
module.exports.userLogin = (email) => {
    return db.query(`SELECT * FROM users WHERE email = ${email}`)
}

//needs to be 
module.exports.insertUserSignature = (first, last, sign, userid) => {
    return db.query(`INSERT INTO signatures (firstname, lastname, signa, userid) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [first, last, sign, userid])
                }
/*
module.exports.insertUserSignature = (sign, userid) => {
    return db.query(`INSERT INTO signatures (signa, userid) VALUES ($1, $2) RETURNING id`,
                    [sign, userid])         
}*/

module.exports.getTotalNumber = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`)

}

module.exports.getSigners = () => {
    return db.query(`SELECT firstname,lastname FROM signatures`)
}

module.exports.getSignature = (identifier)  => {
    return db.query(`SELECT signa FROM signatures WHERE id = ${identifier}`)
}