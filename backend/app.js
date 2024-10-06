const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env file
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;
const LIGHTBOX_API_KEY = process.env.LIGHTBOX_API_KEY;
const USDA_SOIL_API_KEY = process.env.USDA_SOIL_API_KEY;

console.log('LIGHTBOX_API_KEY:', LIGHTBOX_API_KEY);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cors for React frontend requests
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080', // React frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// MySQL Connection Setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Default MySQL port
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Fetch data from APIs (Lightbox, USDA, Weather)
async function fetchCoordinates(userAddress) {
  const apiUrl = `https://api.lightboxre.com/v1/addresses/search?text=${encodeURIComponent(userAddress)}`;
  console.log('Fetching coordinates for:', userAddress);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'accept': 'application/json',
        'x-api-key': LIGHTBOX_API_KEY
      }
    });
    
    if (!response.data || !response.data.addresses || response.data.addresses.length === 0) {
      throw new Error('Address not found or invalid');
    }

    console.log('Coordinates received:', response.data);
    const firstAddress = response.data.addresses[0];
    const { latitude, longitude } = firstAddress.location.representativePoint;
    return { latitude, longitude };
  } catch (error) {
    console.error('Error fetching coordinates:', error.response?.data || error.message);
    throw new Error('Error fetching coordinates');
  }
}

async function fetchSoilData(latitude, longitude) {
  const apiUrl = `https://zcwyesjbjkuvaay3dikbl4z7e40hhbmi.lambda-url.us-east-1.on.aws/api/usda/soilsurveys/layers/mapunits/geometry`;
  const wkt = `POINT(${longitude} ${latitude})`;
  try {
    const response = await axios.get(apiUrl, {
      params: { wkt, includecomponents: 'true', includecropyields: 'true', bufferunits: 'm', bufferdistance: 20, apikey: USDA_SOIL_API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching soil data:', error.message);
    throw new Error('Error fetching soil data');
  }
}

async function fetchWeatherData(latitude, longitude, startDate, endDate) {
  const apiUrl = `https://archive-api.open-meteo.com/v1/archive`;
  const params = { latitude, longitude, start_date: startDate, end_date: endDate, hourly: 'temperature_2m,precipitation,wind_speed_10m', timezone: 'auto' };
  try {
    const response = await axios.get(apiUrl, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw new Error('Error fetching weather data');
  }
}

function summarizeWeatherData(weatherData) {
  const hourlyTemps = weatherData.hourly.temperature_2m;
  const hourlyPrecipitation = weatherData.hourly.precipitation;
  const hourlyWindSpeeds = weatherData.hourly.wind_speed_10m;

  const avgTemp = (hourlyTemps.reduce((a, b) => a + b, 0) / hourlyTemps.length).toFixed(2);
  const minTemp = Math.min(...hourlyTemps).toFixed(2);
  const maxTemp = Math.max(...hourlyTemps).toFixed(2);
  const totalPrecipitation = hourlyPrecipitation.reduce((a, b) => a + b, 0).toFixed(2);
  const avgPrecipitation = (totalPrecipitation / hourlyPrecipitation.length).toFixed(2);
  const avgWindSpeed = (hourlyWindSpeeds.reduce((a, b) => a + b, 0) / hourlyWindSpeeds.length).toFixed(2);
  const maxWindSpeed = Math.max(...hourlyWindSpeeds).toFixed(2);

  return { avgTemp, minTemp, maxTemp, totalPrecipitation, avgPrecipitation, avgWindSpeed, maxWindSpeed };
}

app.get('/submit-address', (req, res) => {
  res.render('index');
});

// Handle form submission via POST and show result page with EJS
app.post('/submit-address', async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const { latitude, longitude } = await fetchCoordinates(address);
    const soilData = await fetchSoilData(latitude, longitude);
    const weatherData = await fetchWeatherData(latitude, longitude, '2020-01-01', '2023-12-30');
    const weatherSummary = summarizeWeatherData(weatherData);

    const resultData = {
      address,
      latitude,
      longitude,
      soilName: soilData.mapUnits[0].name,
      soilType: soilData.mapUnits[0].kind,
      farmClass: soilData.mapUnits[0].farmClass || 'Unknown',
      weatherSummary,
    };

    res.json(resultData);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'There was an issue processing your request' });
  }
});

// Static Files (React app)
// Serve React static assets in production mode
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route for serving React index.html for React routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
