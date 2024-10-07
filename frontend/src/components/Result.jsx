import React, { useState } from 'react';
import axios from 'axios';

function Result({ result, onSubmit }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address.trim() === '') {
      alert('Please enter a valid address');
      return;
    }
    onSubmit(address); // Send the address to the parent App component's handleFormSubmit function
  };

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    setRecommendation('');

    const apiData = {
      soilType: result.soilType,
      avgTemp: result.weatherSummary.avgTemp,
      totalPrecipitation: result.weatherSummary.totalPrecipitation,
      windSpeed: result.weatherSummary.avgWindSpeed,
      latitude: result.latitude,  // Pass latitude
      longitude: result.longitude  // Pass longitude
    };

    try {
      const response = await axios.post('http://localhost:3000/get-crop-recommendation', apiData);
      setRecommendation(response.data.recommendation);
      onSubmit(response.data.result); // Update the parent with the new result (including daylight)
    } catch (err) {
      setError('Error fetching recommendation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="result-container">
      <link rel="stylesheet" href="http://localhost:3000/css/style2.css" />

      {/* New Address Search Form */}
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Enter your address"
          />
        </label>
        <button type="submit">Submit</button>
      </form>

      {/* Results */}
      <h2>Results for: {result.address}</h2>

      <p><strong>Coordinates:</strong></p>
      <p>Latitude: {result.latitude}</p>
      <p>Longitude: {result.longitude}</p>

      <p><strong>Soil Information:</strong></p>
      <p>Soil Name: {result.soilName}</p>
      <p>Soil Type: {result.soilType}</p>
      <p>Farm Class: {result.farmClass}</p>

      {/* Weather Summary with tooltip */}
      <p className="hover-text">
        <strong>Weather Summary:</strong>
        <span className="tooltip-text">Data gathered from a timeframe of 2020-01-01 to 2023-12-30</span>
      </p>
      <p>Average Temperature: {result.weatherSummary.avgTemp}°C</p>
      <p>Min Temperature: {result.weatherSummary.minTemp}°C</p>
      <p>Max Temperature: {result.weatherSummary.maxTemp}°C</p>
      <p>Total Precipitation: {result.weatherSummary.totalPrecipitation} mm</p>
      <p>Average Wind Speed: {result.weatherSummary.avgWindSpeed} km/h</p>
      <p>Max Wind Speed: {result.weatherSummary.maxWindSpeed} km/h</p>

      {/* Display Day Length */}
      <p><strong>Sunlight:</strong></p> 
      <p>Average Day Length: {result.averageDayLength}</p>

      {/* Button to Fetch Crop Recommendation */}
      <button onClick={fetchRecommendation} disabled={loading}>
        {loading ? 'Loading...' : 'Get Crop Recommendation'}
      </button>

      {/* Display Crop Recommendation */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {recommendation && (
        <p>
          <strong>Recommended Crop:</strong> {recommendation}
        </p>
      )}
    </div>
  );
}

export default Result;
