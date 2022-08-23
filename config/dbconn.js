require('dotenv').config();

const mysql = require('mysql');

const connection = mysql.createPool({
    host: process.env.host,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    port: process.env.dbPort,
    database: process.env.databaseName,
    multipleStatements: true,
    connectionLimit: 5
})

module.exports = connection;