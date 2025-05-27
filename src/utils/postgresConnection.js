require("dotenv").config({ path: `.env` });
const {Client} = require('pg');
const createUserTable = require('../tables/userTable')
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

