const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const favicon = require('serve-favicon');
const OpenAI = require('openai');

const app = express();


// Cors for React frontend requests
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Load environment variables from the .env file
dotenv.config();

const PORT = process.env.PORT || 3000;
const LIGHTBOX_API_KEY = process.env.LIGHTBOX_API_KEY;
const USDA_SOIL_API_KEY = process.env.USDA_SOIL_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Serve static files (e.g., CSS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the favicon from the public directory
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure OpenAI API
const openai = new OpenAI({
  api_key: OPENAI_API_KEY,
});

// Route for GPT-4 Turbo API to generate crop recommendation
app.post('/get-crop-recommendation', async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    // Fetch coordinates based on the address
    const { latitude, longitude } = await fetchCoordinates(address);
    
    // Fetch soil data
    const soilData = await fetchSoilData(latitude, longitude);
    
    // Fetch weather data
    const weatherData = await fetchWeatherData(latitude, longitude, '2020-01-01', '2023-12-30');
    const weatherSummary = summarizeWeatherData(weatherData);

    // Fetch day length data and calculate average day length
    const timestamps = [1350526582, 1350363600, 1350277200];  // Example timestamps
    const dayLengthData = await fetchDayLengthData(latitude, longitude, timestamps);
    const averageDayLength = calculateAverageDayLength(dayLengthData);

    // Create a prompt for GPT-4 Turbo
    const prompt = `
      Based on the following details:
      Soil Type: ${soilData.mapUnits[0].kind}
      Average Temperature: ${weatherSummary.avgTemp}°C
      Total Precipitation: ${weatherSummary.totalPrecipitation} mm
      Average Wind Speed: ${weatherSummary.avgWindSpeed} km/h
      Average Day Length: ${averageDayLength}
      
      What would be the most suitable crop to grow in this region?`;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: 'You are an agricultural expert.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
    });

    const recommendation = gptResponse.choices[0].message.content;
    console.log('Sending recommendation to the frontend:', recommendation);

    res.json({ recommendation });
  } catch (error) {
    console.error('Error generating crop recommendation:', error.message);
    res.status(500).json({ error: 'There was an issue processing your request' });
  }
});

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// Fetch coordinates with better error logging
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
      console.error('No addresses found for:', userAddress);
      throw new Error('Address not found or invalid');
    }

    console.log('Coordinates received:', response.data);
    const firstAddress = response.data.addresses[0];
    const { latitude, longitude } = firstAddress.location.representativePoint;
    return { latitude, longitude };
  } catch (error) {
    console.error('Error fetching coordinates from Lightbox:', error.response?.data || error.message);
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

// New: Fetch day length data from Farmsense API
async function fetchDayLengthData(latitude, longitude, timestamps) {
  const apiUrl = `https://api.farmsense.net/v1/daylengths/?lat=${latitude}&lon=${longitude}&d[]=${timestamps.join('&d[]=')}`;
  
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching day length data:', error.message);
    throw new Error('Error fetching day length data');
  }
}

// New: Calculate average day length from the fetched data
function calculateAverageDayLength(dayLengthData) {
  const dayLengthsInSeconds = dayLengthData.map(entry => {
    const [hours, minutes, seconds] = entry.Daylength.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
  });

  const totalDayLength = dayLengthsInSeconds.reduce((a, b) => a + b, 0);
  const averageDayLengthInSeconds = totalDayLength / dayLengthsInSeconds.length;

  const hours = Math.floor(averageDayLengthInSeconds / 3600);
  const minutes = Math.floor((averageDayLengthInSeconds % 3600) / 60);
  const seconds = Math.floor(averageDayLengthInSeconds % 60);

  return `${hours}:${minutes}:${seconds}`;  // Return the average day length in HH:MM:SS format
}

// Summarize weather data
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
    const timestamps = [1350526582, 1350363600, 1350277200];  // Example timestamps
    const dayLengthData = await fetchDayLengthData(latitude, longitude, timestamps);
    const averageDayLength = calculateAverageDayLength(dayLengthData);

    const resultData = {
      address,
      latitude,
      longitude,
      soilName: soilData.mapUnits[0].name,
      soilType: soilData.mapUnits[0].kind,
      farmClass: soilData.mapUnits[0].farmClass || 'Unknown',
      weatherSummary,
      averageDayLength
    };

    res.json(resultData);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'There was an issue processing your request' });
  }
});

// Catch-all route for serving React index.html for React routes
app.get('*', (req, res) => {
  if (!req.url.startsWith('/submit-address')) {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  } else {
    res.status(404).send('Not Found');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
