const express = require('express');
const axios = require('axios');
const pg = require('pg');
const path = require('path');
const app = express();
const PORT = 3000;

// DB setup
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "srn",
    port: 5432,
  });
  db.connect();
  
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  const dbBooks = await db.query('SELECT * FROM books');
  res.render('index', { books: dbBooks.rows });
});

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
    const books = response.data.docs.slice(0, 10);
    res.render('search', { books });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching book data.');
  }
});

app.post('/add', async (req, res) => {
  const { title, author, cover } = req.body;
  try {
    await db.query('INSERT INTO books (title, author, cover) VALUES ($1, $2, $3)', [title, author, cover]);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving to database.');
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));