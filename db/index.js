require('dotenv').config()
const { Pool } = require('pg');

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// const db = new Pool({
//     user: 'Hanna',
//     host: 'localhost',
//     database: 'budgetdb',
//     password: 'hbub',
//     port: 5432,
// });


const db = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: {
        require: true,
    },
});

module.exports = {db};