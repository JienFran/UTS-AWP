const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: "trolley.proxy.rlwy.net",
  port: "34469",
  user: "root",
  password: "AvSBodNsdedddbCqMVFCgQarhfkijnAo",
  database: "railway"
});

conn.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('MySQL Connected!');
  }
});


module.exports = conn;
