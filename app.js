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
const USDA_SOIL_API_KEY = process.env.USDA_SOIL_API_KEY;  // Get USDA Soil API key from .env file

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

// Function to fetch soil data from the USDA API using coordinates
async function fetchSoilData(latitude, longitude) {
  const apiUrl = `https://zcwyesjbjkuvaay3dikbl4z7e40hhbmi.lambda-url.us-east-1.on.aws/api/usda/soilsurveys/layers/mapunits/geometry`;
  const wkt = `POINT(${longitude} ${latitude})`;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        wkt,
        includecomponents: 'true',
        includecropyields: 'true',
        bufferunits: 'm',
        bufferdistance: 20,
        apikey: USDA_SOIL_API_KEY
      }
    });

    const soilData = response.data;
    return soilData;
  } catch (error) {
    console.error('Error fetching soil data:', error.message);
    throw new Error('Error fetching soil data');
  }
}

// Route to render the homepage
app.get('/', (req, res) => {
  res.render('index');
});

// Handle address submission and fetch both coordinates and soil data
app.post('/submit-address', async (req, res) => {
  const userAddress = req.body.address;

  try {
    // Fetch coordinates from LightBox API
    const { latitude, longitude } = await fetchCoordinates(userAddress);

    // Fetch soil data from USDA API
    const soilData = await fetchSoilData(latitude, longitude);

    // Extract useful information
    const mapUnit = soilData.mapUnits[0];
    const soilName = mapUnit.name;
    const soilType = mapUnit.kind;
    const farmClass = mapUnit.farmClass || 'Unknown';
    const slope = `${mapUnit.componentAggregated.slope_l || 0} to ${mapUnit.componentAggregated.slope_h || 'unknown'} percent`;
    const drainageClass = mapUnit.componentAggregated.drainagecl || 'Unknown';
    const runoff = mapUnit.componentAggregated.runoff || 'Unknown';
    const aws025wta = mapUnit.componentAggregated.aws025wta || 'Unknown';
    const aws050wta = mapUnit.componentAggregated.aws050wta || 'Unknown';
    const aws0100wta = mapUnit.componentAggregated.aws0100wta || 'Unknown';
    const aws0150wta = mapUnit.componentAggregated.aws0150wta || 'Unknown';
    const avgAirTemp = mapUnit.componentAggregated.airtempa_r || 'Unknown';
    const meanAnnualPrecip = mapUnit.componentAggregated.map_r || 'Unknown';
    const hydgrpDesc = mapUnit.componentAggregated.hydgrp_desc || 'Unknown';
    const floodFreq = mapUnit.componentAggregated.flodfreqdcd || 'None';
    const pondingFreq = mapUnit.componentAggregated.pondfreqprs || 'None';

    // Save the coordinates to MySQL database
    const query = 'INSERT INTO addresses (address, latitude, longitude) VALUES (?, ?, ?)';
    connection.query(query, [userAddress, latitude, longitude], (err, results) => {
      if (err) {
        console.error('Error saving to database:', err);
        return res.status(500).send('Error saving coordinates');
      }

      console.log('Coordinates saved to database:', results);

      // Pass the variables to the EJS template to be rendered on the page
      res.render('result', { 
        address: userAddress, 
        latitude, 
        longitude, 
        soilName,
        soilType,
        farmClass,
        slope,
        drainageClass,
        runoff,
        aws025wta,
        aws050wta,
        aws0100wta,
        aws0150wta,
        avgAirTemp,
        meanAnnualPrecip,
        hydgrpDesc,
        floodFreq,
        pondingFreq
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error retrieving coordinates or soil data');
  }
});

// Start the server (this should only be here once)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
