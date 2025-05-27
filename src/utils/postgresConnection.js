require("dotenv").config({ path: `.env` });
const {Client} = require('pg');
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

