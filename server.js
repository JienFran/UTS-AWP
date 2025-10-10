const express = require("express");
const fs = require("fs");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(__dirname));

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "uts",
});

app.get("/", (req, res) => {
  fs.readFile("index.html", "utf-8", (err, data) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.send(data);
  });
});

app.post("/login", (req, res) => {
  const {
    username,
    password
  } = req.body;
  if (!username || !password)
    return res.send("Username & Password wajib diisi!");

  const q = "SELECT * FROM account WHERE Username = ? AND Password = ?";
  conn.query(q, [username, password], (err, results) => {
    if (err) return res.status(500).send("Database Error");

    if (results.length > 0) {
      req.session.userId = results[0].ID;
      req.session.username = results[0].Username;

      fs.readFile("main.html", "utf-8", (err, content) => {
        if (err) return res.status(500).send("Internal Server Error");
        const html = content.replace("<!--USERNAME-->", results[0].Username);
        res.send(html);
      });
    } else {
      res.send(`<h3 style="color:red;">Login gagal! Username atau password salah.</h3>`);
    }
  });
});

app.post("/register", (req, res) => {
  const {
    username,
    password
  } = req.body;
  if (!username || !password)
    return res.send("Semua field wajib diisi!");

  const q = "INSERT INTO account (Username, Password) VALUES (?, ?)";
  conn.query(q, [username, password], (err) => {
    if (err) return res.status(500).send("Database Insert Error");
    res.redirect("/");
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/admin", (req, res) => {
  fs.readFile("admin_login.html", "utf-8", (err, data) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.send(data);
  });
});

app.post("/admin_login", (req, res) => {
  const {
    username,
    password
  } = req.body;
  const q = "SELECT * FROM admin WHERE Username_Admin = ? AND Password_Admin = ?";
  conn.query(q, [username, password], (err, results) => {
    if (err) return res.status(500).send("Database Query Error");

    if (results.length > 0) {
      req.session.isAdmin = true;
      req.session.adminName = results[0].Username_Admin;

      fs.readFile("admin_main.html", "utf-8", (err, content) => {
        if (err) return res.status(500).send("Internal Server Error");
        const html = content.replace("<!--USERNAME-->", `${results[0].Username_Admin} (Admin)`);
        res.send(html);
      });
    } else {
      res.send("<h3 style='color:red;'>Login Admin gagal! Username atau password salah.</h3>");
    }
  });
});

app.get("/api/campaigns", (req, res) => {
  const search = req.query.search || "";
  const sort = req.query.sort || "";

  let query = "SELECT * FROM campaigns WHERE title LIKE ?";
  const params = [`%${search}%`];

  if (sort === "donasi") query += " ORDER BY current_amount DESC";
  else if (sort === "target") query += " ORDER BY target_amount DESC";
  else if (sort === "tanggal") query += " ORDER BY end_date DESC";
  else query += " ORDER BY id DESC";

  conn.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching campaigns:", err);
      return res.status(500).json({
        message: "Gagal ambil data kampanye."
      });
    }
    res.json(results);
  });
});

app.get("/api/campaigns/:id", (req, res) => {
  const {
    id
  } = req.params;
  const query = "SELECT * FROM campaigns WHERE id = ?";
  conn.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({
      message: "Gagal mengambil data."
    });
    if (results.length === 0)
      return res.status(404).json({
        message: "Kampanye tidak ditemukan."
      });
    res.json(results[0]);
  });
});

app.post("/api/campaigns", (req, res) => {
  const {
    title,
    description,
    target_amount,
    end_date
  } = req.body;

  if (!title || !target_amount || !end_date) {
    return res.status(400).json({
      error: "Judul, target, dan tanggal wajib diisi."
    });
  }

  if (Number(target_amount) <= 0) {
    return res.status(400).json({
      error: "Target donasi harus lebih dari 0."
    });
  }

  const today = new Date().toISOString().split("T")[0];
  if (end_date < today) {
    return res.status(400).json({
      error: "Tanggal berakhir tidak boleh di masa lalu."
    });
  }

  const sql = `
    INSERT INTO campaigns (title, description, target_amount, current_amount, status, end_date)
    VALUES (?, ?, ?, 0, 'active', ?)
  `;
  conn.query(sql, [title, description, target_amount, end_date], (err, result) => {
    if (err) {
      console.error("Gagal menambah kampanye:", err);
      return res.status(500).json({
        error: "Gagal menambah kampanye."
      });
    }
    res.json({
      message: "Kampanye baru berhasil dibuat!",
      id: result.insertId
    });
  });
});

app.put("/api/campaigns/:id", (req, res) => {
  const {
    id
  } = req.params;
  const {
    title,
    target_amount,
    status,
    end_date
  } = req.body;
  const q = "UPDATE campaigns SET title=?, target_amount=?, status=?, end_date=? WHERE id=?";
  conn.query(q, [title, target_amount, status, end_date, id], (err) => {
    if (err) return res.status(500).json({
      message: "Gagal update data kampanye"
    });
    res.json({
      message: "Kampanye berhasil diperbarui"
    });
  });
});

app.delete("/api/campaigns/:id", (req, res) => {
  const {
    id
  } = req.params;
  conn.query("DELETE FROM campaigns WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({
      message: "Gagal hapus kampanye"
    });
    res.json({
      message: "Kampanye berhasil dihapus"
    });
  });
});

app.post("/api/donasi", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({
      message: "Harus login terlebih dahulu!"
    });

  const {
    nama_donatur,
    nominal,
    pesan
  } = req.body;
  if (!nama_donatur || !nominal)
    return res.status(400).json({
      message: "Nama dan nominal wajib diisi"
    });

  const q = "INSERT INTO donasi (nama_donatur, nominal, pesan, user_id) VALUES (?, ?, ?, ?)";
  conn.query(q, [nama_donatur, nominal, pesan, req.session.userId], (err) => {
    if (err) throw err;
    res.json({
      message: "Donasi berhasil ditambahkan"
    });
  });
});

app.get("/api/donasi", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({
      message: "Silakan login terlebih dahulu!"
    });

  const q = "SELECT * FROM donasi WHERE user_id = ?";
  conn.query(q, [req.session.userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/api/admin/donasi", (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : "%";
  const q = `
    SELECT d.id, d.nama_donatur, d.nominal, d.pesan, d.tanggal, a.Username AS pemilik_akun
    FROM donasi d
    LEFT JOIN account a ON d.user_id = a.ID
    WHERE d.nama_donatur LIKE ?
    ORDER BY d.tanggal DESC
  `;
  conn.query(q, [search], (err, results) => {
    if (err) return res.status(500).json({
      error: err.message
    });
    res.json(results);
  });
});

app.delete("/api/admin/donasi/:id", (req, res) => {
  const {
    id
  } = req.params;
  conn.query("DELETE FROM donasi WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({
      error: err.message
    });
    res.json({
      message: "Donasi berhasil dihapus oleh admin"
    });
  });
});

app.put("/api/admin/donasi/:id", (req, res) => {
  const {
    id
  } = req.params;
  const {
    nama_donatur,
    nominal,
    pesan
  } = req.body;

  if (!nama_donatur || !nominal)
    return res.status(400).json({
      message: "Nama dan nominal wajib diisi!"
    });

  const q = "UPDATE donasi SET nama_donatur=?, nominal=?, pesan=? WHERE id=?";
  conn.query(q, [nama_donatur, nominal, pesan, id], (err, result) => {
    if (err) return res.status(500).json({
      error: err.message
    });
    if (result.affectedRows === 0)
      return res.status(404).json({
        message: "Data donasi tidak ditemukan!"
      });
    res.json({
      message: "Data donasi berhasil diperbarui!"
    });
  });
});

app.get("/api/stats", (req, res) => {
  const q1 = "SELECT IFNULL(SUM(nominal), 0) AS total_donasi FROM donasi";
  const q2 = "SELECT COUNT(DISTINCT nama_donatur) AS total_donatur FROM donasi";
  const q3 = "SELECT COUNT(id) AS total_kampanye FROM campaigns";

  conn.query(q1, (err, r1) => {
    if (err) return res.status(500).json({
      error: err.message
    });
    conn.query(q2, (err, r2) => {
      if (err) return res.status(500).json({
        error: err.message
      });
      conn.query(q3, (err, r3) => {
        if (err) return res.status(500).json({
          error: err.message
        });
        res.json({
          total_donasi: r1[0].total_donasi || 0,
          total_donatur: r2[0].total_donatur || 0,
          total_kampanye: r3[0].total_kampanye || 0,
        });
      });
    });
  });
});

app.listen(3001, () => {
  console.log("✅ Server running at http://localhost:3001");
});