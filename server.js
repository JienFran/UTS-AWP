const express = require('express');
const fs = require('fs');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    return res.send('<h3 style="color:red; text-align:center;">Username & Password wajib diisi!</h3><a href="/">Kembali</a>');

  const q = 'SELECT * FROM account WHERE Username = ? AND Password = ?';
  conn.query(q, [username, password], (err, results) => {
    if (err) return res.status(500).send('Database Error');

    if (results.length > 0) {
      fs.readFile('main.html', 'utf-8', (err, content) => {
        if (err) return res.status(500).send('Internal Server Error');
        const html = content.replace('<!--USERNAME-->', results[0].Username);
        res.send(html);
      });
    } else {
      res.send('<h3 style="color:red; text-align:center;">Login gagal! Username atau password salah.</h3><a href="/">Coba Lagi</a>');
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

app.post('/api/donasi', (req, res) => {
  const { nama_donatur, nominal, pesan } = req.body;
  if (!nama_donatur || !nominal)
    return res.status(400).json({ message: 'Nama dan nominal wajib diisi' });

  conn.query('INSERT INTO donasi (nama_donatur, nominal, pesan) VALUES (?, ?, ?)',
    [nama_donatur, nominal, pesan],
    err => {
      if (err) throw err;
      res.json({ message: 'Data berhasil ditambahkan' });
    });
});

app.get('/api/donasi', (req, res) => {
  conn.query('SELECT * FROM donasi', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.put('/api/donasi/:id', (req, res) => {
  const { id } = req.params;
  const { nama_donatur, nominal, pesan } = req.body;
  conn.query('UPDATE donasi SET nama_donatur=?, nominal=?, pesan=? WHERE id=?',
    [nama_donatur, nominal, pesan, id],
    err => {
      if (err) throw err;
      res.json({ message: 'Data berhasil diupdate' });
    });
});

app.delete('/api/donasi/:id', (req, res) => {
  const { id } = req.params;
  conn.query('DELETE FROM donasi WHERE id=?', [id], err => {
    if (err) throw err;
    res.json({ message: 'Data berhasil dihapus' });
  });
});

app.get('/api/stats', (req, res) => {
  const totalDonasiQuery = 'SELECT SUM(nominal) AS total_donasi FROM donasi';
  const totalDonaturQuery = 'SELECT COUNT(DISTINCT nama_donatur) AS total_donatur FROM donasi';
  const totalKampanyeQuery = 'SELECT COUNT(*) AS total_kampanye FROM donasi'; 

  conn.query(totalDonasiQuery, (err, donasiResult) => {
    if (err) return res.status(500).json({ error: err.message });

    conn.query(totalDonaturQuery, (err, donaturResult) => {
      if (err) return res.status(500).json({ error: err.message });

      conn.query(totalKampanyeQuery, (err, kampanyeResult) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          total_donasi: donasiResult[0].total_donasi || 0,
          total_donatur: donaturResult[0].total_donatur || 0,
          total_kampanye: kampanyeResult[0].total_kampanye || 0
        });
      });
    });
  });
});

app.listen(3001, () => {
  console.log('✅ Server running at http://localhost:3001');
});
