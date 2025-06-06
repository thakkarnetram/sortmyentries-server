// modules and configs
require("dotenv").config({ path: `.env` });
const {Client} = require('pg');

// Import tables for creation at the beginning
const createUserTable = require('../tables/userTable')
const createOtpTable = require('../tables/otpTable')
const createBuyerTable = require('../tables/buyerTable')
const createSellerTable = require('../tables/sellerTable')

// opening db connection
const connection = new Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    port:Number(process.env.PG_PORT),
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD
});

connection.connect()
    .then(()=>{
        console.log("Database connected ")
    })
    .catch((err) => {
        console.log(err)
    })

const createTables = async () => {
    try {
        await connection.query(createUserTable);
        await connection.query(createOtpTable);
        await connection.query(createBuyerTable);
        await connection.query(createSellerTable);
    } catch (err) {
        console.log(err)
    }
}

createTables()
    .then(() => {
        console.log("Table Created ")
    })
    .catch((err) => {
        console.log(err)
    });

module.exports = connection;
