const mysql = require('mysql2');

// ================================
//  🔴 Koneksi Railway (DISABLED)
// ================================
// const conn = mysql.createConnection({
//   host: "trolley.proxy.rlwy.net",
//   port: "34469",
//   user: "root",
//   password: "AvSBodNsdedddbCqMVFCgQarhfkijnAo",
//   database: "railway"
// });

// ================================
//  🟢 Koneksi Localhost XAMPP MySQL
// ================================
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",       // default XAMPP = kosong
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
