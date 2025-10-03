const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'uts' 
});

conn.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('MySQL Connected!');
  }
});

module.exports = conn;
