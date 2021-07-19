DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    firstname VARCHAR NOT NULL CHECK (firstname != ''),
    lastname VARCHAR NOT NULL CHECK (lastname != ''),
    email VARCHAR UNIQUE NOT NULL CHECK (email != ''),
    hashedpassword VARCHAR NOT NULL CHECK (hashedpassword != '')
 );

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    signa VARCHAR NOT NULL CHECK (signa != ''),
    userid INT NOT NULL REFERENCES users(id)
);