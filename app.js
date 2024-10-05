const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const mysql = require('mysql2');

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files (CSS, images)
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/submit-address', (req, res) => {
  const userAddress = req.body.address;
  // Handle the address (send it to an API, etc.)
  res.send(`Address submitted: ${userAddress}`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Create connection to your MySQL database
const connection = mysql.createConnection(process.env.JAWSDB_URL || {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'garden_db'
  });
  
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      return;
    }
    console.log('Connected to the database');
  });
  