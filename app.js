const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (CSS, images)
app.use(express.static('public'));

// Setnode app.js EJS as the templating engine
app.set('view engine', 'ejs');

// Error-handling middleware (for catching errors)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// MySQL Connection Setup
const connection = mysql.createConnection({
  host: 'i2cpbxbi4neiupid.cbetxkdyhwsb.us-east-1.rds.amazonaws.com', // Hostname from your URL
  user: 'xx7whqlvpplxm744',       // Username from your URL
  password: 'yv8welkz6vuknnjq',   // Password from your URL
  database: 'ekgec8ucybart0ex',   // Database name from your URL
  port: 3306                      // Port number (usually 3306 for MySQL)
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');

  // Start the server only after a successful database connection
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/submit-address', (req, res) => {
  const userAddress = req.body.address;
  // Here you can interact with the MySQL database and the Lightbox API
  res.send(`Address submitted: ${userAddress}`);
});
