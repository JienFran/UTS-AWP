const express = require('express');
const fs = require('fs');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'uts'
});

app.get('/', (req, res) => {
  fs.readFile('index.html', 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Internal Server Error');
    res.send(data);
  });
});


app.post('/login', (req, res) => {
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
                        <a href="/" 
                          class="inline-block bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out">
                          Coba Lagi
                        </a>
                      </div>
                    </body>
                    </html>
                    `);

  const q = 'SELECT * FROM account WHERE Username = ? AND Password = ?';
  conn.query(q, [username, password], (err, results) => {
    if (err) return res.status(500).send('Database Error');

    if (results.length > 0) {
      req.session.userId = results[0].ID;
      req.session.username = results[0].Username;

      fs.readFile('main.html', 'utf-8', (err, content) => {
        if (err) return res.status(500).send('Internal Server Error');
        const html = content.replace('<!--USERNAME-->', results[0].Username);
        res.send(html);
      });
    } else {
      res.send(`
        <!DOCTYPE html>
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
            <a href="/" 
              class="inline-block bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out">
              Coba Lagi
            </a>
          </div>
        </body>
        </html>
        `);
    }
  });
});

app.get('/register', (req, res) => {
  fs.readFile('register.html', 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Internal Server Error');
    res.send(data);
  });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.send('<h3 style="color:red; text-align:center;">Semua field wajib diisi!</h3><a href="/register">Kembali</a>');

  const q = 'INSERT INTO account (Username, Password) VALUES (?, ?)';
  conn.query(q, [username, password], err => {
    if (err) return res.status(500).send('Database Insert Error');
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/api/donasi', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: 'Harus login terlebih dahulu!' });

  const { nama_donatur, nominal, pesan } = req.body;
  if (!nama_donatur || !nominal)
    return res.status(400).json({ message: 'Nama dan nominal wajib diisi' });

  const q = 'INSERT INTO donasi (nama_donatur, nominal, pesan, user_id) VALUES (?, ?, ?, ?)';
  conn.query(q, [nama_donatur, nominal, pesan, req.session.userId], err => {
    if (err) throw err;
    res.json({ message: 'Donasi berhasil ditambahkan' });
  });
});

app.get('/api/donasi', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: 'Silakan login terlebih dahulu!' });

  conn.query('SELECT * FROM donasi WHERE user_id = ?', [req.session.userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/api/admin/donasi', (req, res) => {
  const q = `
    SELECT d.id, d.nama_donatur, d.nominal, d.pesan, d.tanggal, a.Username AS pemilik_akun
    FROM donasi d
    LEFT JOIN account a ON d.user_id = a.ID
    ORDER BY d.tanggal DESC
  `;
  conn.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete('/api/admin/donasi/:id', (req, res) => {
  const { id } = req.params;
  conn.query('DELETE FROM donasi WHERE id = ?', [id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Donasi berhasil dihapus oleh admin' });
  });
});

app.get('/admin', (req, res) => {
  fs.readFile('admin_login.html', 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Internal Server Error');
    res.send(data);
  });
});

app.post('/admin_login', (req, res) => {
  const { username, password } = req.body;
  const q = 'SELECT * FROM admin WHERE Username_Admin = ? AND Password_Admin = ?';
  conn.query(q, [username, password], (err, results) => {
    if (err) return res.status(500).send('Database Query Error');

    if (results.length > 0) {
      req.session.isAdmin = true;
      req.session.adminName = results[0].Username_Admin;

      fs.readFile('admin_main.html', 'utf-8', (err, content) => {
        if (err) return res.status(500).send('Internal Server Error');
        const html = content.replace('<!--USERNAME-->', `${results[0].Username_Admin} (Admin)`);
        res.send(html);
      });
    } else {
      res.send('<h3 style="color:red; text-align:center;">Login Admin gagal! Username atau password salah.</h3><a href="/admin">Coba Lagi</a>');
    }
  });
});

app.get('/api/admin/donasi', (req, res) => {
  const query = `
    SELECT d.id, d.nama_donatur, d.nominal, d.pesan, d.tanggal, a.Username AS pemilik_akun
    FROM donasi d
    LEFT JOIN account a ON d.user_id = a.ID
    ORDER BY d.tanggal DESC
  `;
  conn.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete('/api/admin/donasi/:id', (req, res) => {
  const { id } = req.params;
  conn.query('DELETE FROM donasi WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Donasi berhasil dihapus oleh admin' });
  });
});

app.put('/api/admin/donasi/:id', (req, res) => {
  const { id } = req.params;
  const { nama_donatur, nominal, pesan } = req.body;

  if (!nama_donatur || !nominal) {
    return res.status(400).json({ message: 'Nama dan nominal wajib diisi!' });
  }

  const query = 'UPDATE donasi SET nama_donatur = ?, nominal = ?, pesan = ? WHERE id = ?';
  conn.query(query, [nama_donatur, nominal, pesan, id], (err, result) => {
    if (err) {
      console.error('❌ Error update data:', err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data donasi tidak ditemukan!' });
    }

    res.json({ message: '✅ Data donasi berhasil diperbarui!' });
  });
});


app.get('/api/stats', (req, res) => {
  const q1 = 'SELECT IFNULL(SUM(nominal), 0) AS total_donasi FROM donasi';
  const q2 = 'SELECT COUNT(DISTINCT nama_donatur) AS total_donatur FROM donasi';
  const q3 = 'SELECT 0 AS total_kampanye'; 

  conn.query(q1, (err, r1) => {
    if (err) return res.status(500).json({ error: err.message });
    conn.query(q2, (err, r2) => {
      if (err) return res.status(500).json({ error: err.message });
      conn.query(q3, (err, r3) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          total_donasi: r1[0].total_donasi || 0,
          total_donatur: r2[0].total_donatur || 0,
          total_kampanye: r3[0].total_kampanye || 0
        });
      });
    });
  });
});


app.listen(3001, () => {
  console.log('✅ Server running at http://localhost:3001');
});
