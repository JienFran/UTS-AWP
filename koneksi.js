const mysql = require('mysql2');

// const conn = mysql.createConnection({
//   host: "trolley.proxy.rlwy.net",
//   port: "34469",
//   user: "root",
//   password: "AvSBodNsdedddbCqMVFCgQarhfkijnAo",
//   database: "railway"
// });

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "uts"
});

conn.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Local Connected! (Database: uts)");
  }
});

module.exports = conn;
