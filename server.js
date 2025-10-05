const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const conn = require('./koneksi.js');

const server = http.createServer((req, res) => {

  //LOGIN USER 
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('index.html', 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());

    req.on('end', () => {
      const form = querystring.parse(body);
      const username = form.username;
      const password = form.password;

      if (!username || !password) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end('<h3 style="color:red; text-align:center;">Username & Password wajib diisi!</h3><a href="/">Kembali</a>');
      }

      const q = "SELECT * FROM account WHERE Username = ? AND Password = ?";
      conn.query(q, [username, password], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          return res.end('Database Query Error');
        }

        if (results.length > 0) {
          fs.readFile('main.html', 'utf-8', (err, content) => {
            if (err) return res.end('Internal Server Error');
            const html = content.replace('<!--USERNAME-->', results[0].Username);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h3 style="color:red; text-align:center;">Login gagal! Username atau password salah.</h3><a href="/">Coba Lagi</a>');
        }
      });
    });
  }

  //REGISTER USER
  else if (req.method === 'GET' && req.url === '/register') {
    fs.readFile('register.html', 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  else if (req.method === 'POST' && req.url === '/register') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const form = querystring.parse(body);
      const username = form.username;
      const password = form.password;

      if (!username || !password) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end('<h3 style="color:red; text-align:center;">Semua field wajib diisi!</h3><a href="/register">Kembali</a>');
      }

      const q = "INSERT INTO account (Username, Password) VALUES (?, ?)";
      conn.query(q, [username, password], (err, result) => {
        if (err) {
          console.error('Register failed:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          return res.end('Database Insert Error');
        }
        res.writeHead(302, { 'Location': '/' });
        res.end();
      });
    });
  }

  //LOGIN ADMIN 
  else if (req.method === 'GET' && req.url === '/admin') {
    fs.readFile('admin_login.html', 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  else if (req.method === 'POST' && req.url === '/admin_login') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const form = querystring.parse(body);
      const username = form.username;
      const password = form.password;

      const q = "SELECT * FROM admin WHERE Username_Admin = ? AND Password_Admin = ?";
      conn.query(q, [username, password], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          return res.end('Database Query Error');
        }

        if (results.length > 0) {
          fs.readFile('admin_main.html', 'utf-8', (err, content) => {
            if (err) return res.end('Internal Server Error');
            const html = content.replace('<!--USERNAME-->', `${results[0].Username_Admin} (Admin)`);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h3 style="color:red; text-align:center;">Login Admin gagal! Username atau password salah.</h3><a href="/admin">Coba Lagi</a>');
        }
      });
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
