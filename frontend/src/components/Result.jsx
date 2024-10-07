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
    onSubmit(address);  // Send the address to the parent App component's handleFormSubmit function
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
      onSubmit(response.data.result);  // Update the parent with the new result (including daylight)
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

      {/* Address and Coordinates */}
      <h2>Results for: {result.address}</h2>
      <p>Latitude: {result.latitude}</p>
      <p>Longitude: {result.longitude}</p>

      {/* Soil Information */}
      <p className="hover-text">
        <strong>Soil Information:</strong>
        <span className="tooltip-text">Many plants require certain nutrient compositions in their soil. Check a seed packet's label to see if it matches where you will be growing them.</span>
      </p>
      <p>Soil Name: {result.soilName}</p>
      <p>Soil Type: {result.soilType}</p>
      <p>Farm Classification: {result.farmClass}</p>

      {/* Drainage and Runoff */}
      <p className="hover-text">
        <strong>Drainage and Runoff:</strong>
        <span className="tooltip-text">This concerns how water in your area is circulated.</span>
      </p>
      <p>Drainage Class: {result.drainageClass}</p>
      <p>Runoff: {result.runoff}</p>

      {/* Water Storage */}
      <p className="hover-text">
        <strong>Water Storage:</strong>
        <span className="tooltip-text"></span>
      </p>
      <p>Available Water Storage (0-25 cm): {result.aws025wta} cm</p>
      <p>Available Water Storage (0-50 cm): {result.aws050wta} cm</p>
      <p>Available Water Storage (0-100 cm): {result.aws0100wta} cm</p>
      <p>Available Water Storage (0-150 cm): {result.aws0150wta} cm</p>

      {/* Soil Conditions */}
      <p className="hover-text">
        <strong>Soil Conditions:</strong>
        <span className="tooltip-text"></span>
      </p>
      <p>Slope: {result.slope}</p>
      <p>Flooding Frequency: {result.floodFreq}</p>
      <p>Ponding Frequency: {result.pondingFreq}</p>

      {/* Soil Temperature and Moisture */}
      <p className="hover-text">
        <strong>Soil Temperature and Moisture:</strong>
        <span className="tooltip-text"></span>
      </p>
      <p>Average Air Temperature: {result.avgAirTemp}°C</p>
      <p>Mean Annual Precipitation: {result.meanAnnualPrecip} mm</p>

      {/* Hydrologic Group */}
      <p className="hover-text">
        <strong>Hydrologic Group:</strong>
        <span className="tooltip-text">The Hydrologic Group, designated A, B, C, or D, indicates in general, the amount of runoff to be expected from the soil when saturated.</span>
      </p>
      <p>Hydrologic Group: {result.hydgrpDesc}</p>

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
      <p className="hover-text">
        <strong>Sunlight:</strong>
        <span className="tooltip-text">The average is 12 hours.</span>
      </p>
      <p>Average Day Length: {result.averageDayLength}</p>

      {/* Button to Fetch Crop Recommendation */}
      <button onClick={fetchRecommendation} disabled={loading}>
        {loading ? 'Loading...' : 'Get Crop Recommendation'}
      </button>

      {/* Display Crop Recommendation */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {recommendation && (
        <p><strong>Recommended Crop:</strong> {recommendation}</p>
      )}
    </div>
  );
}

export default Result;