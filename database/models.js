require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_Host,
  user: process.env.DB_User,
  port: process.env.DB_Port,
  password: process.env.DB_Password,
  database: process.env.DB_Name,
  max: 50,
  connectionTimeoutMillis: 5000,
  idleTimoutMillis: 1000
});

module.exports = { pool };

//Example Insert into statement:
  //INSERT INTO users (name, email, password, rating, difficulty) VALUES('justin', 'jtat5912@gmail.com', 'HellYa', 1000, 'easy');
  //Just don't specify id and you're fine