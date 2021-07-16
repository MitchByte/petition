const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition_database_name") //returns an object

//talking to the database
module.exports.getCities = () => {
    return db.query(`SELECT * FROM cities`)
}