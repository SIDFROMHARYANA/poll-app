const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

const route = require('./routes/route')

app.use(bodyParser.json());

// MySQL connection setup
const pool = mysql.createPool({
    host: '3306',
    user: 'root',
    password: 'jgj',
    database: 'polls',
});



 
app.listen(PORT, () => {
   
    console.log(`Server is running on port ${PORT}`);
});
