const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

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