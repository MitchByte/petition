DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS profiles;
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
    signa VARCHAR NOT NULL CHECK (signa != ''),
    userid INT NOT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    userid INT NOT NULL UNIQUE REFERENCES users(id),
    age INT,
    city VARCHAR,
    homepage VARCHAR
);