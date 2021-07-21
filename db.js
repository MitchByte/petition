const spicedPg = require("spiced-pg");
const db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/petition");


module.exports.userRegister = (first, last, email, hashedpw) => {
    return db.query(`INSERT INTO users (firstname, lastname, email, hashedpassword) VALUES ($1, $2, $3, $4) RETURNING id`,
    [first, last, email, hashedpw])
}

//SELECT to find all the data for a user in the users table by their email address.
module.exports.userLogin = (mail) => {
    return db.query(`SELECT * FROM users WHERE email = '${mail}'`)
}

module.exports.insertUserSignature = (sign, userid) => {
    return db.query(`INSERT INTO signatures (signa, userid) VALUES ($1, $2) RETURNING id`,
                    [sign, userid])
                }


module.exports.getTotalNumber = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`)

}

module.exports.getSigners = () => {
    return db.query(`SELECT users.firstname, users.lastname, profiles.age, profiles.city, profiles.homepage
    FROM users
    JOIN signatures ON users.id = signatures.userid
    FULL JOIN profiles ON users.id = profiles.userid`)
}

module.exports.getSignature = (identifier)  => {
    return db.query(`SELECT id,signa FROM signatures WHERE userid = ${identifier}`)
}

module.exports.addProfile = (userid,age,city,homepage) => {
    return db.query(`INSERT INTO profiles (userid,age,city,homepage) VALUES ($1, $2, $3, $4)`,
    [userid,age,city,homepage])
}

module.exports.getSignersByCity = (city) => {
    return db.query(`SELECT users.firstname, users.lastname, profiles.age, profiles.homepage 
    FROM users
    FULL JOIN profiles ON users.id = profiles.userid
    WHERE profiles.city = '${city}'`)
}

module.exports.getUpdate = (userid) => {
    return db.query(`SELECT users.*,profiles.* FROM users JOIN profiles ON users.id = profiles.userid WHERE profiles.userid = ${userid}`)
}

module.exports.addUpdateUsersPw = (userid,firstname,lastname,email,hashedpw) => {
    return db.query(`UPDATE users SET firstname = $2 ,lastname = $3 , email = $4, hashedpassword = $5 WHERE id = $1`,
    [userid,firstname,lastname,email,hashedpw])
}

module.exports.addUpdateUsers = (userid,firstname,lastname,email) => {
    return db.query(`UPDATE users SET firstname = $2 ,lastname = $3 , email = $4  WHERE id = $1`,
    [userid,firstname,lastname,email])

}

module.exports.addUpdateProfiles = (userid,age,lowerCity,homepage) => {
    return db.query(` INSERT INTO profiles (userid, age, city, homepage) VALUES ($1,$2,$3,$4) ON CONFLICT (userid) DO UPDATE SET age = $2, city = $3, homepage = $4 `,
    [userid,age,lowerCity,homepage])
}

module.exports.deleteSign = (userid) => {
    return db.query(`DELETE FROM signatures WHERE userid = ${userid}`)
}