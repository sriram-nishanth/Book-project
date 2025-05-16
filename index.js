const express = require('express');
const axios = require('axios');
const ejs = require('ejs');
const { Pool } = require('pg');
const path = require('path');

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // ensure views folder is located correctly

// Routes
app.get('/', async (req, res) => {
  try {
    const dbBooks = await pool.query('SELECT * FROM books');
    res.render('index', { books: dbBooks.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching books from database.');
  }
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
    await pool.query('INSERT INTO books (title, author, cover) VALUES ($1, $2, $3)', [title, author, cover]);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving to database.');
  }
});

// Start server on Render's provided port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));