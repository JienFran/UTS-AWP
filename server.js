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

const conn = require("./koneksi");

//======INI BUAT TEMPLATE NOTIFIKASI ERROR======
function renderNotification(res, {
  title,
  header,
  message,
  button,
  redirect
}) {
  fs.readFile("notification.html", "utf-8", (err, html) => {
    if (err) return res.status(500).send("Error loading notification");

    html = html
      .replace("<!--TITLE-->", title)
      .replace("<!--HEADER-->", header)
      .replace("<!--MESSAGE-->", message)
      .replace("<!--BUTTON-->", button)
      .replace("<!--REDIRECT-->", redirect);

    res.send(html);
  });
}




// ==========================================================
// HOME(INDEX)
// ==========================================================
app.get("/", (req, res) => {
  fs.readFile("index.html", "utf-8", (err, data) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.send(data);
  });
});



// ==========================================================
// LOGIN
// ==========================================================
app.post("/login", (req, res) => {
  const {
    username,
    password
  } = req.body;

  if (!username || !password) {
    return renderNotification(res, {
      title: "Login Gagal",
      header: "Login Gagal!",
      message: "Username atau password tidak boleh kosong!",
      button: "Coba Lagi",
      redirect: "/login.html"
    });
  }


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
      return renderNotification(res, {
        title: "Login Gagal",
        header: "Username/Password Salah!",
        message: "Silakan cek kembali username dan password Anda.",
        button: "Coba Lagi",
        redirect: "/login.html"
      });

    }
  });
});



// ==========================================================
// REGISTER
// ==========================================================
app.post("/register", (req, res) => {
  const {
    username,
    password
  } = req.body;

  //Error Field Kosong
  if (!username || !password) {
    return renderNotification(res, {
      title: "Register Gagal",
      header: "Form Tidak Lengkap",
      message: "Semua field wajib diisi!",
      button: "Coba Lagi",
      redirect: "/register.html"
    });
  }

  //Cek password
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isLongEnough = password.length >= 6;

  if (!hasUppercase || !hasNumber || !isLongEnough) {
    return renderNotification(res, {
      title: "Register Gagal",
      header: "Password Tidak Valid",
      message: "Password harus minimal 6 karakter, mengandung 1 huruf kapital, dan 1 angka.",
      button: "Kembali",
      redirect: "/register.html"
    });
  }

  //Masukin DB
  const q = "INSERT INTO account (Username, Password) VALUES (?, ?)";

  conn.query(q, [username, password], (err) => {
    if (err)
      return res.status(500).send("Database Insert Error");

    res.redirect("/");
  });
});




// ==========================================================
// LOGOUT
// ==========================================================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});



// ==========================================================
// ADMIN LOGIN
// ==========================================================
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
          "",
          `${results[0].Username_Admin} (Admin)`
        );
        res.send(html);
      });
    } else {
      return renderNotification(res, {
        title: "Login Admin Gagal",
        header: "Login Admin Gagal!",
        message: "Username atau password admin salah!",
        button: "Coba Lagi",
        redirect: "/admin",
      });
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
  const {
    id
  } = req.params;

  const query = "SELECT * FROM campaigns WHERE id = ?";

  conn.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching single campaign:", err);
      return res
        .status(500)
        .json({
          message: "Gagal mengambil data kampanye."
        });
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({
        message: "Kampanye tidak ditemukan."
      });
    }
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
    end_date,
    image_url
  } = req.body;
  if (!title || !target_amount || !status || !end_date) {
    return res.status(400).json({
      message: "Semua field wajib diisi."
    });
  }

  const query =
    "UPDATE campaigns SET title = ?, target_amount = ?, status = ?, end_date = ?, image_url = ? WHERE id = ?";

  const params = [title, target_amount, status, end_date, image_url, id];

  conn.query(query, params, (err, results) => {
    if (err) {
      console.error("Error updating campaign:", err);
      return res.status(500).json({
        message: "Gagal mengupdate kampanye."
      });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: "Kampanye tidak ditemukan."
      });
    }
    res.json({
      message: "Kampanye berhasil diupdate!"
    });
  });
});


app.delete("/api/campaigns/:id", (req, res) => {
  const {
    id
  } = req.params;
  const query = "DELETE FROM campaigns WHERE id = ?";

  conn.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting campaign:", err);
      return res.status(500).json({
        message: "Gagal menghapus kampanye."
      });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: "Kampanye tidak ditemukan."
      });
    }
    res.json({
      message: "Kampanye berhasil dihapus!"
    });
  });
});


app.delete("/api/admin/donasi/:id", (req, res) => {
  const {
    id
  } = req.params;
  let donationAmount = 0;
  let campaignId = 0;

  conn.beginTransaction((err) => {
    if (err) {
      console.error("Error memulai transaksi:", err);
      return res.status(500).json({
        message: "Kesalahan server."
      });
    }

    const getDonationQuery =
      "SELECT nominal, campaign_id FROM donasi WHERE id = ?";
    conn.query(getDonationQuery, [id], (err, results) => {
      if (err || results.length === 0) {
        return conn.rollback(() => {
          res.status(404).json({
            message: "Data donasi tidak ditemukan."
          });
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
                .json({
                  message: "Gagal mengupdate total donasi kampanye."
                });
            });
          }

          const deleteDonationQuery = "DELETE FROM donasi WHERE id = ?";
          conn.query(deleteDonationQuery, [id], (err, results) => {
            if (err) {
              return conn.rollback(() => {
                console.error("Error menghapus donasi:", err);
                res
                  .status(500)
                  .json({
                    message: "Gagal menghapus data donasi."
                  });
              });
            }

            conn.commit((err) => {
              if (err) {
                return conn.rollback(() => {
                  res
                    .status(500)
                    .json({
                      message: "Gagal menyelesaikan transaksi."
                    });
                });
              }
              res.json({
                message: "Donasi berhasil dihapus dan total kampanye telah diperbarui!",
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
    res.status(200).json({
      username: req.session.username
    });
  } else {
    res.status(401).json({
      message: "User not authenticated"
    });
  }
});


app.post("/api/donate", (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({
        message: "Anda harus login untuk berdonasi."
      });
  }

  const {
    campaignId,
    nama,
    nominal,
    pesan
  } = req.body;
  const userId = req.session.userId;

  if (!campaignId || !nama || !nominal) {
    return res.status(400).json({
      message: "Data donasi tidak lengkap."
    });
  }

  conn.beginTransaction((err) => {
    if (err) {
      console.error("Error memulai transaksi:", err);
      return res
        .status(500)
        .json({
          message: "Terjadi kesalahan pada server."
        });
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
            res.status(500).json({
              message: "Gagal menyimpan data donasi."
            });
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
                    .json({
                      message: "Gagal menyelesaikan transaksi."
                    });
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
    if (err) return res.status(500).json({
      error: err.message
    });
    const total = results[0].totalDonasi || 0;
    res.json({
      totalDonasi: total
    });
  });
});


app.get("/api/stats/jumlah-donatur", (req, res) => {
  const q = "SELECT COUNT(DISTINCT user_id) AS jumlahDonatur FROM donasi";
  conn.query(q, (err, results) => {
    if (err) return res.status(500).json({
      error: err.message
    });
    res.json({
      jumlahDonatur: results[0].jumlahDonatur
    });
  });
});


app.get("/api/stats/total-kampanye", (req, res) => {
  const q = "SELECT COUNT(*) AS totalKampanye FROM campaigns";
  conn.query(q, (err, results) => {
    if (err) return res.status(500).json({
      error: err.message
    });
    res.json({
      totalKampanye: results[0].totalKampanye
    });
  });
});


app.post("/api/campaigns", (req, res) => {
  const {
    title,
    description,
    target_amount,
    end_date,
    image_url
  } = req.body;

  if (!title || !target_amount || !end_date) {
    return res
      .status(400)
      .json({
        message: "Judul, target, dan tanggal akhir wajib diisi."
      });
  }

  const query =
    "INSERT INTO campaigns (title, description, target_amount, end_date, image_url, status, current_amount) VALUES (?, ?, ?, ?, ?, 'active', 0)";

  const params = [title, description, target_amount, end_date, image_url];

  conn.query(query, params, (err, results) => {
    if (err) {
      console.error("Error creating new campaign:", err);
      return res
        .status(500)
        .json({
          message: "Gagal menyimpan kampanye ke database."
        });
    }
    res.status(201).json({
      message: "Kampanye baru berhasil ditambahkan!",
      newCampaignId: results.insertId,
    });
  });
});

app.post("/api/admin/donasi/bulk", (req, res) => {
  const entries = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({
      message: "Data bulk kosong atau tidak valid."
    });
  }

  const SYSTEM_USER_ACCOUNT_ID = 6; //Pake akun sistem

  for (const d of entries) {
    if (!d.nama || !d.nominal || !d.campaignId) {
      return res.status(400).json({
        message: "Setiap baris wajib memiliki nama, nominal, dan campaignId.",
      });
    }
  }

  const normalized = entries.map(e => ({
    nama: String(e.nama).trim(),
    nominal: Number(e.nominal),
    pesan: e.pesan ? String(e.pesan).trim() : "",
    campaignId: Number(e.campaignId),
  }));

  const campaignIds = Array.from(new Set(normalized.map(x => x.campaignId)));
  const placeholders = campaignIds.map(() => "?").join(",");
  conn.query(
    `SELECT id FROM campaigns WHERE id IN (${placeholders})`,
    campaignIds,
    (err, rows) => {
      if (err) {
        console.error("Error checking campaigns:", err);
        return res.status(500).json({
          message: "Gagal validasi campaign.",
          error: err
        });
      }

      const foundIds = rows.map(r => r.id);
      const missing = campaignIds.filter(id => !foundIds.includes(id));
      if (missing.length > 0) {
        return res.status(400).json({
          message: `Campaign ID tidak ditemukan: ${missing.join(", ")}`,
        });
      }

      const now = new Date();
      const values = normalized.map(d => [
        SYSTEM_USER_ACCOUNT_ID,
        d.nama,
        d.nominal,
        d.pesan,
        now,
        d.campaignId
      ]);

      const sql = `
        INSERT INTO donasi (user_id, nama_donatur, nominal, pesan, tanggal, campaign_id)
        VALUES ?
      `;

      conn.query(sql, [values], (insertErr, result) => {
        if (insertErr) {
          console.error("Error Bulk Insert:", insertErr);
          return res.status(500).json({
            message: "Gagal menyimpan donasi bulk.",
            error: insertErr
          });
        }

        return res.status(201).json({
          message: "Donasi bulk berhasil disimpan!",
          totalInserted: result.affectedRows,
        });
      });
    }
  );
});

app.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});