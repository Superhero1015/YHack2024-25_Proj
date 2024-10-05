const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const LIGHTBOX_API_KEY = process.env.LIGHTBOX_API_KEY;  // Get LightBox API key from .env file

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (CSS, images)
app.use(express.static('public'));

// Set EJS as the templating engine
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

// Function to fetch coordinates from the LightBox API
async function fetchCoordinates(userAddress) {
  const apiUrl = `https://api.lightboxre.com/v1/addresses/search?text=${encodeURIComponent(userAddress)}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'accept': 'application/json',
        'x-api-key': LIGHTBOX_API_KEY
      }
    });

    const firstAddress = response.data.addresses[0];
    const latitude = firstAddress.location.representativePoint.latitude;
    const longitude = firstAddress.location.representativePoint.longitude;

    return { latitude, longitude };
  } catch (error) {
    throw new Error('Error fetching coordinates');
  }
}

// Route to render the homepage
app.get('/', (req, res) => {
  res.render('index');
});

// Handle address submission and save coordinates to the database
app.post('/submit-address', async (req, res) => {
  const userAddress = req.body.address;

  try {
    const { latitude, longitude } = await fetchCoordinates(userAddress);

    // Save the coordinates to MySQL database
    const query = 'INSERT INTO addresses (address, latitude, longitude) VALUES (?, ?, ?)';
    connection.query(query, [userAddress, latitude, longitude], (err, results) => {
      if (err) {
        console.error('Error saving to database:', err);
        return res.status(500).send('Error saving coordinates');
      }

      console.log('Coordinates saved to database:', results);

      // Send the result back to the client
      res.send(`Address: ${userAddress}, Latitude: ${latitude}, Longitude: ${longitude}`);
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error retrieving coordinates');
  }
});
