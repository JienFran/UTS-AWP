const express = require("express");
const fs = require("fs");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(__dirname));

const conn = mysql.createConnection({
  host: "trolley.proxy.rlwy.net",
  port: "34469",
  user: "root",
  password: "AvSBodNsdedddbCqMVFCgQarhfkijnAo",
  database: "railway"
});

app.get("/", (req, res) => {
  fs.readFile("index.html", "utf-8", (err, data) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.send(data);
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.send(`<!DOCTYPE html>
      <head>
        <title>Gagal Login!</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-red-50 to-red-200">
        <div class="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
          <div class="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 5.5a6.5 6.5 0 016.5 6.5 6.5 6.5 0 01-13 0A6.5 6.5 0 0112 5.5z" />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-red-600 mb-2">Login Gagal!</h2>
          <p class="text-gray-700 mb-6">Username atau password tidak boleh kosong!</p>
          <a href="/login.html" class="inline-block bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out">
            Coba Lagi
          </a>
        </div>
      </body>
    </html>`);

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
      res.send(`<!DOCTYPE html>
        <head>
          <title>Gagal Login!</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-red-50 to-red-200">
          <div class="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
            <div class="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 5.5a6.5 6.5 0 016.5 6.5 6.5 6.5 0 01-13 0A6.5 6.5 0 0112 5.5z" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-red-600 mb-2">Login Gagal!</h2>
            <p class="text-gray-700 mb-6">Username atau password yang kamu masukkan salah!</p>
            <a href="/login.html" class="inline-block bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out">
              Coba Lagi
            </a>
          </div>
        </body>
      </html>`);
    }
  });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send("Semua field wajib diisi!");

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
  const { username, password } = req.body;
  const q =
    "SELECT * FROM admin WHERE Username_Admin = ? AND Password_Admin = ?";

  conn.query(q, [username, password], (err, results) => {
    if (err) return res.status(500).send("Database Query Error");

    if (results.length > 0) {
      req.session.isAdmin = true;
      req.session.adminName = results[0].Username_Admin;

      fs.readFile("admin_main.html", "utf-8", (err, content) => {
        if (err) return res.status(500).send("Internal Server Error");
        const html = content.replace(
          "<!--USERNAME-->",
          `${results[0].Username_Admin} (Admin)`
        );
        res.send(html);
      });
    } else {
      res.send(`<!DOCTYPE html>
        <head>
          <title>Gagal Login Admin!</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-rose-50 to-pink-100">
          <div class="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
            <div class="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 5.5a6.5 6.5 0 016.5 6.5 6.5 6.5 0 01-13 0A6.5 6.5 0 0112 5.5z" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-red-600 mb-2">Login Admin Gagal!</h2>
            <p class="text-gray-700 mb-6">Username atau password admin salah!</p>
            <a href="/admin" class="inline-block bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out">
              Coba Lagi
            </a>
          </div>
        </body>
      </html>`);
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
        message: "Gagal ambil data kampanye.",
      });
    }
    res.json(results);
  });
});

app.get("/api/campaigns/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM campaigns WHERE id = ?";

  conn.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching single campaign:", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil data kampanye." });
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: "Kampanye tidak ditemukan." });
    }
  });
});

app.put("/api/campaigns/:id", (req, res) => {
  const { id } = req.params;

  const { title, target_amount, status, end_date, image_url } = req.body;
  if (!title || !target_amount || !status || !end_date) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  const query =
    "UPDATE campaigns SET title = ?, target_amount = ?, status = ?, end_date = ?, image_url = ? WHERE id = ?";

  const params = [title, target_amount, status, end_date, image_url, id];

  conn.query(query, params, (err, results) => {
    if (err) {
      console.error("Error updating campaign:", err);
      return res.status(500).json({ message: "Gagal mengupdate kampanye." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Kampanye tidak ditemukan." });
    }
    res.json({ message: "Kampanye berhasil diupdate!" });
  });
});

app.delete("/api/campaigns/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM campaigns WHERE id = ?";

  conn.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting campaign:", err);
      return res.status(500).json({ message: "Gagal menghapus kampanye." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Kampanye tidak ditemukan." });
    }
    res.json({ message: "Kampanye berhasil dihapus!" });
  });
});

app.delete("/api/admin/donasi/:id", (req, res) => {
  const { id } = req.params;
  let donationAmount = 0;
  let campaignId = 0;

  conn.beginTransaction((err) => {
    if (err) {
      console.error("Error memulai transaksi:", err);
      return res.status(500).json({ message: "Kesalahan server." });
    }

    const getDonationQuery =
      "SELECT nominal, campaign_id FROM donasi WHERE id = ?";
    conn.query(getDonationQuery, [id], (err, results) => {
      if (err || results.length === 0) {
        return conn.rollback(() => {
          res.status(404).json({ message: "Data donasi tidak ditemukan." });
        });
      }

      donationAmount = results[0].nominal;
      campaignId = results[0].campaign_id;

      const updateCampaignQuery =
        "UPDATE campaigns SET current_amount = current_amount - ? WHERE id = ?";
      conn.query(
        updateCampaignQuery,
        [donationAmount, campaignId],
        (err, results) => {
          if (err) {
            return conn.rollback(() => {
              console.error("Error mengupdate kampanye:", err);
              res
                .status(500)
                .json({ message: "Gagal mengupdate total donasi kampanye." });
            });
          }

          const deleteDonationQuery = "DELETE FROM donasi WHERE id = ?";
          conn.query(deleteDonationQuery, [id], (err, results) => {
            if (err) {
              return conn.rollback(() => {
                console.error("Error menghapus donasi:", err);
                res
                  .status(500)
                  .json({ message: "Gagal menghapus data donasi." });
              });
            }

            conn.commit((err) => {
              if (err) {
                return conn.rollback(() => {
                  res
                    .status(500)
                    .json({ message: "Gagal menyelesaikan transaksi." });
                });
              }
              res.json({
                message:
                  "Donasi berhasil dihapus dan total kampanye telah diperbarui!",
              });
            });
          });
        }
      );
    });
  });
});

app.get("/api/user", (req, res) => {
  if (req.session && req.session.username) {
    res.status(200).json({ username: req.session.username });
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
});

app.post("/api/donate", (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ message: "Anda harus login untuk berdonasi." });
  }

  const { campaignId, nama, nominal, pesan } = req.body;
  const userId = req.session.userId;

  if (!campaignId || !nama || !nominal) {
    return res.status(400).json({ message: "Data donasi tidak lengkap." });
  }

  conn.beginTransaction((err) => {
    if (err) {
      console.error("Error memulai transaksi:", err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan pada server." });
    }

    const insertDonationQuery =
      "INSERT INTO donasi (user_id, campaign_id, nama_donatur, nominal, pesan, tanggal) VALUES (?, ?, ?, ?, ?, NOW())";

    conn.query(
      insertDonationQuery,
      [userId, campaignId, nama, nominal, pesan],
      (err, result) => {
        if (err) {
          console.error("Error menyimpan donasi:", err);
          return conn.rollback(() => {
            res.status(500).json({ message: "Gagal menyimpan data donasi." });
          });
        }

        const updateCampaignQuery =
          "UPDATE campaigns SET current_amount = current_amount + ? WHERE id = ?";

        conn.query(
          updateCampaignQuery,
          [nominal, campaignId],
          (err, result) => {
            if (err) {
              console.error("Error mengupdate total kampanye:", err);
              return conn.rollback(() => {
                res.status(500).json({
                  message: "Gagal mengupdate jumlah donasi kampanye.",
                });
              });
            }

            conn.commit((err) => {
              if (err) {
                return conn.rollback(() => {
                  res
                    .status(500)
                    .json({ message: "Gagal menyelesaikan transaksi." });
                });
              }

              console.log("Donasi berhasil diproses!");
              res.status(200).json({
                message: "Terima kasih, donasi Anda berhasil diterima!",
              });
            });
          }
        );
      }
    );
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
    if (err)
      return res.status(500).json({
        error: err.message,
      });
    res.json(results);
  });
});

app.get("/api/stats/total-donasi", (req, res) => {
  const q = "SELECT SUM(nominal) AS totalDonasi FROM donasi";
  conn.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = results[0].totalDonasi || 0;
    res.json({ totalDonasi: total });
  });
});

app.get("/api/stats/jumlah-donatur", (req, res) => {
  const q = "SELECT COUNT(DISTINCT user_id) AS jumlahDonatur FROM donasi";
  conn.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ jumlahDonatur: results[0].jumlahDonatur });
  });
});

app.get("/api/stats/total-kampanye", (req, res) => {
  const q = "SELECT COUNT(*) AS totalKampanye FROM campaigns";
  conn.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ totalKampanye: results[0].totalKampanye });
  });
});

app.post("/api/campaigns", (req, res) => {
  const { title, description, target_amount, end_date, image_url } = req.body;

  if (!title || !target_amount || !end_date) {
    return res
      .status(400)
      .json({ message: "Judul, target, dan tanggal akhir wajib diisi." });
  }

  const query =
    "INSERT INTO campaigns (title, description, target_amount, end_date, image_url, status, current_amount) VALUES (?, ?, ?, ?, ?, 'active', 0)";

  const params = [title, description, target_amount, end_date, image_url];

  conn.query(query, params, (err, results) => {
    if (err) {
      console.error("Error creating new campaign:", err);
      return res
        .status(500)
        .json({ message: "Gagal menyimpan kampanye ke database." });
    }
    res.status(201).json({
      message: "Kampanye baru berhasil ditambahkan!",
      newCampaignId: results.insertId,
    });
  });
});

app.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});
